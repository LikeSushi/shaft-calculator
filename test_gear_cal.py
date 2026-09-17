import unittest
import math
from gear_cal import GearCalculator

class TestGearCalculatorSuite(unittest.TestCase):

    def test_01_spur_gear_geometry(self):
        """
        [Test Case 1] คำนวณเรขาคณิตเฟืองตรง (Spur Gear Geometry)
        - m = 2.0 mm, Z1 = 20 (Pinion), Z2 = 40 (Gear)
        - d1 = 2.0 * 20 = 40 mm, d2 = 2.0 * 40 = 80 mm
        - Center Distance a = (40 + 80) / 2 = 60 mm
        - Circular Pitch p = pi * 2.0 ≈ 6.283 mm
        - Gear Ratio i = 40 / 20 = 2.0
        """
        geom = GearCalculator.calculate_spur_gear_geometry(module=2.0, teeth_pinion=20, teeth_gear=40)
        self.assertEqual(geom["d1_pinion_mm"], 40.0)
        self.assertEqual(geom["d2_gear_mm"], 80.0)
        self.assertEqual(geom["center_distance_mm"], 60.0)
        self.assertAlmostEqual(geom["circular_pitch_mm"], 6.28318, places=4)
        self.assertEqual(geom["gear_ratio"], 2.0)

    def test_02_gear_forces(self):
        """
        [Test Case 2] คำนวณแรงที่ฟันเฟือง (Tangential WT & Radial WR)
        - Power = 150 W, N = 60 RPM -> T ≈ 23.8732 N-m
        - d1 = 40 mm
        - WT = 2000 * 23.8732 / 40 ≈ 1193.66 N
        - WR = WT * tan(20 deg) ≈ 1193.66 * 0.36397 = 434.46 N
        """
        forces = GearCalculator.calculate_gear_forces(power_w=150.0, rpm=60.0, pitch_diameter_mm=40.0, pressure_angle_deg=20.0)
        self.assertAlmostEqual(forces["torque_nm"], 23.8732, places=3)
        self.assertAlmostEqual(forces["wt_tangential_n"], 1193.66, places=1)
        self.assertAlmostEqual(forces["wr_radial_n"], 434.46, places=1)

    def test_03_lewis_bending_strength(self):
        """
        [Test Case 3] คำนวณความแข็งแรงสมการลูอิส (Lewis Bending Strength)
        - m = 2.0 mm, b = 20 mm, Z1 = 20 (y = 0.104), sigma_b = 140 MPa
        - WT_allow = 140 * 20 * pi * 2.0 * 0.104 ≈ 1829.7 N
        """
        lewis = GearCalculator.calculate_lewis_bending_strength(module=2.0, face_width_mm=20.0, teeth_pinion=20, allowable_stress_mpa=140.0)
        self.assertEqual(lewis["lewis_y_factor"], 0.104)
        self.assertAlmostEqual(lewis["wt_allowable_n"], 1829.7, places=1)

if __name__ == "__main__":
    unittest.main()
