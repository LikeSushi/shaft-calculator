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
        self.assertEqual(shaft_mat.calculate_asme_allowable_shear(has_keyway=False, use_material_properties=True), 108.0)
        self.assertEqual(shaft_mat.calculate_asme_allowable_shear(has_keyway=True, use_material_properties=True), 81.0)

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
        self.assertEqual(vm["ra_n"], 250.0)
        self.assertEqual(vm["rb_n"], 250.0)
        self.assertEqual(vm["m_max_nm"], 125.0)

    def test_13_multi_point_loads_vm_diagram(self):
        shaft = AdvancedMechanicalShaft()
        # L = 100 mm, W1 = 300 N at 30 mm, W2 = 500 N at 70 mm
        # Rb = (300*30 + 500*70)/100 = (9000 + 35000)/100 = 440 N
        # Ra = 800 - 440 = 360 N
        loads = [{"w_n": 300.0, "x_mm": 30.0}, {"w_n": 500.0, "x_mm": 70.0}]
        vm = shaft.calculate_multi_load_vm_diagram(length_mm=100.0, loads=loads, beam_type="ss")
        self.assertEqual(vm["ra_n"], 360.0)
        self.assertEqual(vm["rb_n"], 440.0)
        self.assertGreater(vm["m_max_nm"], 0)

    def test_14_cantilever_beam_vm_diagram(self):
        shaft = AdvancedMechanicalShaft()
        # Cantilever beam L = 100 mm, fixed at x = 0, W1 = 400 N at x = 100 mm
        # Ra = 400 N, M_fixed = 400 * 100 = 40,000 N-mm = 40 N-m
        loads = [{"w_n": 400.0, "x_mm": 100.0}]
        vm = shaft.calculate_multi_load_vm_diagram(length_mm=100.0, loads=loads, beam_type="cantilever")
        self.assertEqual(vm["ra_n"], 400.0)
        self.assertEqual(vm["ma_fixed_nmm"], 40000.0)
        self.assertEqual(vm["m_max_nm"], 40.0)

if __name__ == "__main__":
    unittest.main()
