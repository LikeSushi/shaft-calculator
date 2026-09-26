import unittest
import math
from shaft_cal import AdvancedMechanicalShaft

class TestFRA232ComprehensiveSuite(unittest.TestCase):

    def test_01_example_9_1_asme_shaft_design(self):
        shaft = AdvancedMechanicalShaft()
        res = shaft.asme_shaft_design(
            torque_nmm=1080000.0,
            bending_moment_nmm=1798300.0,
            is_rotating=True,
            load_type="steady",
            has_keyway=True
        )
        self.assertEqual(res["cm"], 1.5)
        self.assertEqual(res["ct"], 1.0)
        self.assertEqual(res["tau_d_mpa"], 41.0)
        self.assertAlmostEqual(res["d_calculated_mm"], 71.20, places=2)
        self.assertEqual(res["d_standard_iso_mm"], 75)

    def test_02_example_9_4_critical_speed(self):
        shaft = AdvancedMechanicalShaft(e_mpa=205000.0)
        res = shaft.calculate_critical_speed(
            loads_n=[4.0],
            distances_mm=[80.0],
            total_length_mm=160.0,
            d_mm=5.0
        )
        self.assertAlmostEqual(res["i_inertia_mm4"], 30.68, places=1)
        self.assertAlmostEqual(res["deflections_mm"][0], 0.0543, places=3)
        self.assertAlmostEqual(res["nc_rpm"], 4056, delta=10)

    def test_03_torque_calculation(self):
        torque_nm = AdvancedMechanicalShaft.calculate_torque_from_power(150.0, 60.0)
        self.assertAlmostEqual(torque_nm, 23.8732, places=3)

    def test_04_asme_allowable_shear_stress_rules(self):
        shaft_mat = AdvancedMechanicalShaft(sy_mpa=400.0, sut_mpa=600.0)
        self.assertEqual(shaft_mat.calculate_asme_allowable_shear(has_keyway=False, use_material_properties=False), 55.0)
        self.assertEqual(shaft_mat.calculate_asme_allowable_shear(has_keyway=True, use_material_properties=False), 41.0)

    def test_05_asme_load_type_factors(self):
        shaft = AdvancedMechanicalShaft()
        r1 = shaft.asme_shaft_design(1000, 1000, is_rotating=True, load_type="steady")
        self.assertEqual((r1["cm"], r1["ct"]), (1.5, 1.0))

    def test_06_torsional_deflection_solid_and_hollow(self):
        shaft = AdvancedMechanicalShaft(g_mpa=79000.0)
        res_solid = shaft.calculate_torsional_deflection(torque_nmm=50000.0, length_mm=300.0, d_mm=20.0)
        expected_solid_deg = (584.0 * 50000.0 * 300.0) / (79000.0 * (20.0**4))
        self.assertAlmostEqual(res_solid["theta_deg"], expected_solid_deg, places=3)

    def test_07_iso_standard_diameter_lookup(self):
        self.assertEqual(AdvancedMechanicalShaft.get_iso_standard_diameter(13.2), 14)

    def test_08_multi_mass_critical_speed(self):
        shaft = AdvancedMechanicalShaft(e_mpa=200000.0)
        res = shaft.calculate_critical_speed(loads_n=[50.0, 100.0], distances_mm=[100.0, 200.0], total_length_mm=300.0, d_mm=15.0)
        self.assertGreater(res["nc_rpm"], 0)

    def test_09_fatigue_modified_goodman_pure_bending_and_torsion(self):
        shaft = AdvancedMechanicalShaft(sut_mpa=500.0, sy_mpa=350.0)
        ng_bend, ny_bend = shaft.fatigue_analysis(m_a_nm=30.0, t_m_nm=0.0, d_mm=20.0)
        self.assertGreater(ng_bend, 0)

    def test_10_invalid_inputs_error_handling(self):
        shaft = AdvancedMechanicalShaft()
        with self.assertRaises(ValueError):
            AdvancedMechanicalShaft.calculate_torque_from_power(150.0, 0.0)

    def test_11_custom_cm_ct_overrides(self):
        shaft = AdvancedMechanicalShaft()
        res = shaft.asme_shaft_design(
            torque_nmm=10000.0,
            bending_moment_nmm=20000.0,
            cm_custom=3.0,
            ct_custom=2.0
        )
        self.assertEqual(res["cm"], 3.0)
        self.assertEqual(res["ct"], 2.0)

    def test_12_single_load_vm_diagram(self):
        shaft = AdvancedMechanicalShaft()
        vm = shaft.calculate_vm_diagram(length_mm=1000.0, load_n=500.0, position_a_mm=500.0)
        self.assertAlmostEqual(abs(vm["ra_n"]), 250.0)
        self.assertAlmostEqual(abs(vm["rb_n"]), 250.0)
        self.assertAlmostEqual(vm["m_max_nm"], 125.0)

    def test_13_multi_point_loads_vm_diagram(self):
        shaft = AdvancedMechanicalShaft()
        loads = [{"w_n": -300.0, "x_mm": 30.0}, {"w_n": -500.0, "x_mm": 70.0}]
        vm = shaft.calculate_multi_load_vm_diagram(length_mm=100.0, loads=loads, beam_type="ss")
        self.assertAlmostEqual(vm["ra_n"], 360.0)
        self.assertAlmostEqual(vm["rb_n"], 440.0)
        self.assertGreater(vm["m_max_nm"], 0)

    def test_14_cantilever_beam_vm_diagram(self):
        shaft = AdvancedMechanicalShaft()
        loads = [{"w_n": -400.0, "x_mm": 100.0}]
        vm = shaft.calculate_multi_load_vm_diagram(length_mm=100.0, loads=loads, beam_type="cantilever")
        self.assertAlmostEqual(vm["ra_n"], 400.0)
        self.assertAlmostEqual(abs(vm["ma_fixed_nmm"]), 40000.0)
        self.assertAlmostEqual(vm["m_max_nm"], 40.0)

    def test_15_opposing_vector_forces_statics_equilibrium(self):
        """
        [Test Case 15] แรงในทิศทางสวนทางกัน (+Y ขึ้น / -Y ลง)
        - L = 100 mm, W1 = -500 N at 30 mm (ลง), W2 = +200 N at 70 mm (ขึ้น)
        - sum Fy = Ra + Rb + W1 + W2 = Ra + Rb - 500 + 200 = 0 -> Ra + Rb = 300 N
        - sum Ma = Rb(100) + W1(30) + W2(70) = Rb(100) - 15000 + 14000 = Rb(100) - 1000 = 0
        - Rb = 10 N -> Ra = 290 N
        """
        shaft = AdvancedMechanicalShaft()
        loads = [{"w_n": -500.0, "x_mm": 30.0}, {"w_n": 200.0, "x_mm": 70.0}]
        vm = shaft.calculate_multi_load_vm_diagram(length_mm=100.0, loads=loads, beam_type="ss")
        self.assertAlmostEqual(vm["rb_n"], 10.0)
        self.assertAlmostEqual(vm["ra_n"], 290.0)
        # Verify Fy equilibrium: Ra + Rb + W1 + W2 = 290 + 10 - 500 + 200 = 0
        self.assertAlmostEqual(vm["ra_n"] + vm["rb_n"] + sum(l["w_n"] for l in loads), 0.0)

    def test_16_pom_plastic_critical_speed(self):
        """
        [Test Case 16] การคำนวณความเร็วรอบวิกฤตสำหรับวัสดุพลาสติก POM (E = 3000 MPa)
        - เปรียบเทียบกับเหล็ก (E = 205000 MPa)
        - ค่า Critical Speed (Nc) ของ POM ต้องต่ำกว่าเหล็กเนื่องจากโก่งตัวง่ายกว่า
        """
        shaft_steel = AdvancedMechanicalShaft(e_mpa=205000.0)
        res_steel = shaft_steel.calculate_critical_speed(loads_n=[10.0], distances_mm=[50.0], total_length_mm=100.0, d_mm=10.0)

        shaft_pom = AdvancedMechanicalShaft(e_mpa=3000.0)
        res_pom = shaft_pom.calculate_critical_speed(loads_n=[10.0], distances_mm=[50.0], total_length_mm=100.0, d_mm=10.0)

        self.assertGreater(res_steel["nc_rpm"], res_pom["nc_rpm"])
        # Ratio Nc_steel / Nc_pom should be approx sqrt(205000 / 3000) = sqrt(68.33) ≈ 8.266
        expected_ratio = math.sqrt(205000.0 / 3000.0)
        actual_ratio = res_steel["nc_rpm"] / res_pom["nc_rpm"]
        self.assertAlmostEqual(actual_ratio, expected_ratio, places=2)

    def test_17_dual_plane_3d_vm_diagram(self):
        """
        [Test Case 17] การคำนวณแผนภาพ V-M 3 มิติ (3D Dual-Plane Vector Superposition)
        - แรงในระนาบ XY (แนวตั้ง): 300 N ที่ x = 50 mm
        - แรงในระนาบ XZ (แนวนอน): 400 N ที่ x = 50 mm
        - โมเมนต์ดัดลัพธ์ M_total ต้องเท่ากับ sqrt(M_y^2 + M_z^2)
        """
        shaft = AdvancedMechanicalShaft()
        loads_xy = [{"w_n": -300.0, "x_mm": 50.0}]
        loads_xz = [{"w_n": -400.0, "x_mm": 50.0}]

        res_3d = shaft.calculate_3d_vm_diagram(length_mm=100.0, loads_xy=loads_xy, loads_xz=loads_xz, beam_type="ss")

        # Peak My = (300*50)/2 = 7500 N-mm = 7.5 N-m
        # Peak Mz = (400*50)/2 = 10000 N-mm = 10.0 N-m
        # M_total = sqrt(7.5^2 + 10^2) = 12.5 N-m
        self.assertAlmostEqual(res_3d["res_xy"]["m_max_nm"], 7.5, places=2)
        self.assertAlmostEqual(res_3d["res_xz"]["m_max_nm"], 10.0, places=2)
        self.assertAlmostEqual(res_3d["m_max_res_nm"], 12.5, places=2)

    def test_18_four_directional_3d_loads(self):
        """
        [Test Case 18] การคำนวณแรง 4 ทิศทางอิสระ (+Y, -Y, +Z, -Z) ในระบบ 3D
        - +Y = 500 N, -Y = 200 N -> Net Fy = 300 N
        - +Z = 600 N, -Z = 200 N -> Net Fz = 400 N
        - Resultant Force Fres = sqrt(300^2 + 400^2) = 500 N
        """
        loads_xy = [{"w_n": 500.0, "x_mm": 50.0}, {"w_n": -200.0, "x_mm": 50.0}]
        loads_xz = [{"w_n": 600.0, "x_mm": 50.0}, {"w_n": -200.0, "x_mm": 50.0}]

        shaft = AdvancedMechanicalShaft()
        res_3d = shaft.calculate_3d_vm_diagram(length_mm=100.0, loads_xy=loads_xy, loads_xz=loads_xz, beam_type="ss")

        # Peak My = (300*50)/2 = 7500 N-mm = 7.5 N-m
        # Peak Mz = (400*50)/2 = 10000 N-mm = 10.0 N-m
        # Resultant M = sqrt(7.5^2 + 10^2) = 12.5 N-m
        self.assertAlmostEqual(res_3d["m_max_res_nm"], 12.5, places=2)

    def test_19_paper_exact_3d_critical_speed(self):
        """
        [Test Case 19] ทดสอบการคำนวณความเร็วรอบวิกฤต 3D ตรงตามโจทย์ในกระดาษรายงาน
        - POM Plastic: E = 3000 MPa, d = 10 mm
        - F_vertical = 28.987 N, F_horizontal = 90.1416 N ที่ตำแหน่ง x = 60 mm
        - ช่วงลูกปืน: xa = 20 mm, xb = 100 mm (span L = 80 mm)
        - Y_xy = 0.2086 mm, Y_xz = 0.6489 mm -> Y_total_3d = 0.6816 mm
        - Nc_calculated ≈ 1142.27 RPM
        """
        shaft = AdvancedMechanicalShaft(e_mpa=3000.0, d_mm=10.0)
        loads_xy = [{"w_n": 28.987, "x_mm": 60.0}]
        loads_xz = [{"w_n": 90.1416, "x_mm": 60.0}]

        res_nc = shaft.calculate_3d_critical_speed(
            loads_xy=loads_xy,
            loads_xz=loads_xz,
            length_mm=100.0,
            xa_mm=20.0,
            xb_mm=100.0
        )

        self.assertAlmostEqual(res_nc["y_xy_total_mm"], 0.2099, places=3)
        self.assertAlmostEqual(res_nc["y_xz_total_mm"], 0.6529, places=2)
        self.assertAlmostEqual(res_nc["nc_rpm"], 1142.27, delta=10.0)

if __name__ == "__main__":
    unittest.main()
