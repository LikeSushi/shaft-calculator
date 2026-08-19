import unittest
import math
from shaft_cal import AdvancedMechanicalShaft

class TestFRA232ComprehensiveSuite(unittest.TestCase):

    # =========================================================================
    # 1. TEST CASES FROM FRA232 LECTURE EXAMPLES (ตัวอย่างในชีทเรียน)
    # =========================================================================

    def test_01_example_9_1_asme_shaft_design(self):
        """
        [Test Case 1] ตัวอย่างที่ 9.1 (หน้า 30-48 ในชีทเรียน FRA232-week-03.pdf)
        - T = 1,080 kN-mm, M_B = 1,798.3 kN-mm
        - เพลาหมุน แรงสม่ำเสมอ (Cm = 1.5, Ct = 1.0)
        - มีร่องลิ่ม (tau_d = 41 N/mm^2)
        - ตรวจสอบ: d_calc = 71.20 mm และ ISO Standard = 75 mm
        """
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
        """
        [Test Case 2] ตัวอย่างที่ 9.4 (หน้า 53 ในชีทเรียน FRA232-week-03.pdf)
        - จานกลมหนัก W = 4 N ที่กึ่งกลางเพลายาว L = 160 mm
        - เส้นผ่านศูนย์กลาง d = 5 mm, E = 205,000 N/mm^2
        - ตรวจสอบ: I ≈ 30.7 mm^4, y ≈ 0.0543 mm, nc ≈ 4,056 rpm
        """
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

    # =========================================================================
    # 2. TORQUE & POWER CALCULATIONS
    # =========================================================================

    def test_03_torque_calculation(self):
        """
        [Test Case 3] คำนวณ Torque จาก Power และ RPM
        - P = 150 W, N = 60 RPM -> T = 150 / (2 * pi * 60 / 60) ≈ 23.8732 N-m
        """
        torque_nm = AdvancedMechanicalShaft.calculate_torque_from_power(150.0, 60.0)
        self.assertAlmostEqual(torque_nm, 23.8732, places=3)

    # =========================================================================
    # 3. ASME ALLOWABLE SHEAR STRESS RULES (หน้า 26)
    # =========================================================================

    def test_04_asme_allowable_shear_stress_rules(self):
        """
        [Test Case 4] ตรวจสอบเกณฑ์ tau_d ตามมาตรฐาน ASME
        - Default (ไม่ระบุคุณสมบัติวัสดุ):
            * ไม่มีร่องลิ่ม: 55 MPa
            * มีร่องลิ่ม:   41 MPa
        - Specified Material (Sy = 400 MPa, Sut = 600 MPa):
            * tau_mat = min(0.3 * 400, 0.18 * 600) = min(120, 108) = 108 MPa
            * ไม่มีร่องลิ่ม: 108 MPa
            * มีร่องลิ่ม:   108 * 0.75 = 81 MPa
        """
        shaft_mat = AdvancedMechanicalShaft(sy_mpa=400.0, sut_mpa=600.0)
        
        # Defaults
        self.assertEqual(shaft_mat.calculate_asme_allowable_shear(has_keyway=False, use_material_properties=False), 55.0)
        self.assertEqual(shaft_mat.calculate_asme_allowable_shear(has_keyway=True, use_material_properties=False), 41.0)
        
        # With specified material
        self.assertEqual(shaft_mat.calculate_asme_allowable_shear(has_keyway=False, use_material_properties=True), 108.0)
        self.assertEqual(shaft_mat.calculate_asme_allowable_shear(has_keyway=True, use_material_properties=True), 81.0)

    # =========================================================================
    # 4. LOAD TYPE FATIGUE FACTORS (Cm, Ct) (ตาราง 9.2 หน้า 27)
    # =========================================================================

    def test_05_asme_load_type_factors(self):
        """
        [Test Case 5] ตรวจสอบค่า Cm และ Ct ตามประเภทภาระงานจากตารางที่ 9.2
        """
        shaft = AdvancedMechanicalShaft()
        
        # เพลาหมุน - สม่ำเสมอ
        r1 = shaft.asme_shaft_design(1000, 1000, is_rotating=True, load_type="steady")
        self.assertEqual((r1["cm"], r1["ct"]), (1.5, 1.0))
        
        # เพลาหมุน - กระตุกเบา
        r2 = shaft.asme_shaft_design(1000, 1000, is_rotating=True, load_type="light_shock")
        self.assertEqual((r2["cm"], r2["ct"]), (1.75, 1.25))
        
        # เพลาหมุน - กระตุกแรง
        r3 = shaft.asme_shaft_design(1000, 1000, is_rotating=True, load_type="heavy_shock")
        self.assertEqual((r3["cm"], r3["ct"]), (2.5, 2.25))
        
        # เพลาอยู่นิ่ง - สม่ำเสมอ
        r4 = shaft.asme_shaft_design(1000, 1000, is_rotating=False, load_type="steady")
        self.assertEqual((r4["cm"], r4["ct"]), (1.0, 1.0))

    # =========================================================================
    # 5. TORSIONAL DEFLECTION (SOLID VS HOLLOW SHAFTS) (หน้า 29)
    # =========================================================================

    def test_06_torsional_deflection_solid_and_hollow(self):
        """
        [Test Case 6] ตรวจสอบมุมบิด theta = (584 * T * L) / (G * d^4) ทั้งเพลากลมตันและกลวง
        """
        shaft = AdvancedMechanicalShaft(g_mpa=79000.0)
        # T = 50,000 N-mm, L = 300 mm, d = 20 mm
        
        # เพลาตัน (d = 20mm)
        res_solid = shaft.calculate_torsional_deflection(torque_nmm=50000.0, length_mm=300.0, d_mm=20.0)
        expected_solid_deg = (584.0 * 50000.0 * 300.0) / (79000.0 * (20.0**4))
        self.assertAlmostEqual(res_solid["theta_deg"], expected_solid_deg, places=3)
        
        # เพลากลวง (d = 20mm, di = 10mm -> K = 0.5)
        # theta_hollow = theta_solid / (1 - K^4)
        res_hollow = shaft.calculate_torsional_deflection(torque_nmm=50000.0, length_mm=300.0, d_mm=20.0, d_inner_mm=10.0)
        expected_hollow_deg = expected_solid_deg / (1.0 - (0.5**4))
        self.assertAlmostEqual(res_hollow["theta_deg"], expected_hollow_deg, places=3)

    # =========================================================================
    # 6. ISO STANDARD SIZE LOOKUP (ตาราง 9.1 หน้า 21)
    # =========================================================================

    def test_07_iso_standard_diameter_lookup(self):
        """
        [Test Case 7] ตรวจสอบการค้นหาขนาดมาตรฐาน ISO/R 775-1969
        """
        self.assertEqual(AdvancedMechanicalShaft.get_iso_standard_diameter(13.2), 14)
        self.assertEqual(AdvancedMechanicalShaft.get_iso_standard_diameter(14.0), 14)
        self.assertEqual(AdvancedMechanicalShaft.get_iso_standard_diameter(14.1), 18)
        self.assertEqual(AdvancedMechanicalShaft.get_iso_standard_diameter(71.2), 75)
        self.assertEqual(AdvancedMechanicalShaft.get_iso_standard_diameter(195.0), 200)

    # =========================================================================
    # 7. MULTI-MASS CRITICAL SPEED & OPERATING RANGE
    # =========================================================================

    def test_08_multi_mass_critical_speed(self):
        """
        [Test Case 8] คำนวณความเร็ววิกฤตกรณีมีหลายมวลกระทำ
        """
        shaft = AdvancedMechanicalShaft(e_mpa=200000.0)
        res = shaft.calculate_critical_speed(
            loads_n=[50.0, 100.0],
            distances_mm=[100.0, 200.0],
            total_length_mm=300.0,
            d_mm=15.0
        )
        self.assertGreater(res["nc_rpm"], 0)
        # ตรวจสอบช่วงความเร็วปลอดภัย (+- 25%)
        lower_safe, upper_safe = res["safe_operating_range_rpm"]
        self.assertAlmostEqual(lower_safe, 0.75 * res["nc_rpm"], places=2)
        self.assertAlmostEqual(upper_safe, 1.25 * res["nc_rpm"], places=2)

    # =========================================================================
    # 8. FATIGUE ANALYSIS (MODIFIED GOODMAN & VON MISES YIELD)
    # =========================================================================

    def test_09_fatigue_modified_goodman_pure_bending_and_torsion(self):
        """
        [Test Case 9] วิเคราะห์ความล้ากรณี Pure Bending และ Pure Torsion
        """
        shaft = AdvancedMechanicalShaft(sut_mpa=500.0, sy_mpa=350.0)
        
        # Pure Bending (T_m = 0)
        ng_bend, ny_bend = shaft.fatigue_analysis(m_a_nm=30.0, t_m_nm=0.0, d_mm=20.0)
        self.assertGreater(ng_bend, 0)
        self.assertGreater(ny_bend, 0)
        
        # Pure Torsion (M_a = 0)
        ng_tors, ny_tors = shaft.fatigue_analysis(m_a_nm=0.0, t_m_nm=30.0, d_mm=20.0)
        self.assertGreater(ng_tors, 0)
        self.assertGreater(ny_tors, 0)

    # =========================================================================
    # 9. INVALID INPUTS & ERROR HANDLING
    # =========================================================================

    def test_10_invalid_inputs_error_handling(self):
        """
        [Test Case 10] ตรวจสอบการจัดการข้อผิดพลาดเมื่อป้อนค่าที่ไม่ถูกต้อง
        """
        shaft = AdvancedMechanicalShaft()
        
        # RPM <= 0
        with self.assertRaises(ValueError):
            AdvancedMechanicalShaft.calculate_torque_from_power(150.0, 0.0)
            
        # Diameter <= 0
        with self.assertRaises(ValueError):
            shaft.calculate_torsional_deflection(100.0, 100.0, d_mm=0.0)
            
        with self.assertRaises(ValueError):
            shaft.calculate_critical_speed([10.0], [50.0], 100.0, d_mm=-5.0)

if __name__ == "__main__":
    unittest.main()
