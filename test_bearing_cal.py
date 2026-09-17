import unittest
from bearing_cal import BearingCalculator

class TestBearingCalculatorSuite(unittest.TestCase):

    def test_01_equivalent_load_calculation(self):
        p_eq = BearingCalculator.calculate_equivalent_load(fr_n=4000.0, fa_n=1000.0, v_factor=1.0, x_factor=0.56, y_factor=1.5)
        self.assertEqual(p_eq, 4000.0)

    def test_02_bearing_life_ball_bearing(self):
        res = BearingCalculator.calculate_bearing_life(c_rating_n=12800.0, p_equivalent_n=3200.0, rpm=1000.0, bearing_type="ball")
        self.assertEqual(res["l10_million_revs"], 64.0)
        self.assertAlmostEqual(res["l10_hours"], 1066.6666, places=3)

    def test_03_bearing_life_roller_bearing(self):
        res = BearingCalculator.calculate_bearing_life(c_rating_n=10000.0, p_equivalent_n=2000.0, rpm=500.0, bearing_type="roller")
        self.assertAlmostEqual(res["l10_million_revs"], 213.75, places=1)

    def test_04_standard_iso_6200_bearing_recommendation(self):
        b1 = BearingCalculator.get_standard_bearing_recommendation(20.0)
        self.assertEqual(b1["designation"], "6204")
        self.assertEqual(b1["bore_mm"], 20)

        b2 = BearingCalculator.get_standard_bearing_recommendation(22.0)
        self.assertEqual(b2["designation"], "6205")
        self.assertEqual(b2["bore_mm"], 25)

if __name__ == "__main__":
    unittest.main()
