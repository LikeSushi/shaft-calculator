import unittest
import math
from gear_cal import GearCalculator

class TestGearCalculatorSuite(unittest.TestCase):

    def test_01_excel_exact_benchmark(self):
        """
        [Test Case 1] ทดสอบเปรียบเทียบกับค่าในไฟล์ Excel "FRA232 Gear Design & Selection Calculations.xlsx"
        Inputs: P = 2000 W, np = 690 rpm, mw = 3.5, Np = 16, m = 6.0 mm, kb = 10.0,
                sigma_p = 103.0 N/mm^2, sigma_g = 82.0 N/mm^2, Kf = 1.5, K_wear = 1.182 N/mm^2
        """
        res = GearCalculator.calculate_full_gear_design(
            power_w=2000.0, rpm_pinion=690.0, gear_ratio=3.5, teeth_pinion=16,
            module=6.0, face_width_ratio=10.0, sigma_p=103.0, sigma_g=82.0, kf=1.5, wear_k=1.182
        )

        self.assertEqual(res["teeth_gear"], 56)
        self.assertEqual(res["dp_pinion_mm"], 96.0)
        self.assertEqual(res["dg_gear_mm"], 336.0)
        self.assertEqual(res["face_width_mm"], 60.0)
        self.assertEqual(res["center_distance_mm"], 216.0)
        self.assertAlmostEqual(res["velocity_m_s"], 3.4683, places=3)
        self.assertAlmostEqual(res["tangential_force_ft_n"], 576.65, places=1)
        self.assertAlmostEqual(res["velocity_factor_kv"], 2.1561, places=3)
        self.assertAlmostEqual(res["dynamic_load_fd_n"], 1243.32, places=1)
        self.assertAlmostEqual(res["wear_q"], 1.5556, places=3)
        self.assertAlmostEqual(res["wear_load_fw_n"], 10590.72, places=1)
        self.assertTrue(res["overall_pass"])

    def test_02_module_trial_matrix(self):
        """
        [Test Case 2] ทดสอบการสร้างตารางทดลองโมดูล (Module Trial Matrix)
        - m = 2.0 -> Unsafe (Bending & Wear Fail)
        - m = 6.0 -> Safe (PASS)
        """
        matrix = GearCalculator.generate_module_trial_matrix(
            power_w=2000.0, rpm_pinion=690.0, gear_ratio=3.5, teeth_pinion=16,
            face_width_ratio=10.0, sigma_p=103.0, sigma_g=82.0, kf=1.5, wear_k=1.182
        )
        self.assertEqual(len(matrix), 8)
        self.assertEqual(matrix[0]["design_verdict"], "Unsafe")
        self.assertEqual(matrix[4]["design_verdict"], "Safe")

if __name__ == "__main__":
    unittest.main()
