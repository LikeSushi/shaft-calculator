import math

class BearingCalculator:
    """
    คลาสคำนวณและเลือกใช้งานลูกปืน (Bearing Life & Selection)
    ถอดถอดสมการและหลักการคำนวณจากเอกสารการสอนรายวิชา FRA232 (Structure Design)
    เรื่อง Bearings (Part 2) โดย ผศ.ดร.สุภชัย วงศ์บุนยง (FIBO, KMUTT)
    """
    # ตารางเบอร์ลูกปืนเม็ดกลมร่องลึกมาตรฐาน ISO Series 6200 (Deep Groove Ball Bearings)
    ISO_6200_SERIES = [
        {"designation": "6200", "bore_mm": 10, "outer_mm": 30, "width_mm": 9,  "c_dynamic_n": 5100,  "c0_static_n": 2390},
        {"designation": "6201", "bore_mm": 12, "outer_mm": 32, "width_mm": 10, "c_dynamic_n": 6800,  "c0_static_n": 3050},
        {"designation": "6202", "bore_mm": 15, "outer_mm": 35, "width_mm": 11, "c_dynamic_n": 7800,  "c0_static_n": 3750},
        {"designation": "6203", "bore_mm": 17, "outer_mm": 40, "width_mm": 12, "c_dynamic_n": 9550,  "c0_static_n": 4800},
        {"designation": "6204", "bore_mm": 20, "outer_mm": 47, "width_mm": 14, "c_dynamic_n": 12800, "c0_static_n": 6650},
        {"designation": "6205", "bore_mm": 25, "outer_mm": 52, "width_mm": 15, "c_dynamic_n": 14000, "c0_static_n": 7800},
        {"designation": "6206", "bore_mm": 30, "outer_mm": 62, "width_mm": 16, "c_dynamic_n": 19500, "c0_static_n": 11200},
        {"designation": "6207", "bore_mm": 35, "outer_mm": 72, "width_mm": 17, "c_dynamic_n": 25500, "c0_static_n": 15300},
        {"designation": "6208", "bore_mm": 40, "outer_mm": 80, "width_mm": 18, "c_dynamic_n": 29100, "c0_static_n": 17800},
        {"designation": "6209", "bore_mm": 45, "outer_mm": 85, "width_mm": 19, "c_dynamic_n": 32500, "c0_static_n": 20400},
        {"designation": "6210", "bore_mm": 50, "outer_mm": 90, "width_mm": 20, "c_dynamic_n": 35000, "c0_static_n": 23200},
        {"designation": "6211", "bore_mm": 55, "outer_mm": 100, "width_mm": 21, "c_dynamic_n": 43600, "c0_static_n": 29000},
        {"designation": "6212", "bore_mm": 60, "outer_mm": 110, "width_mm": 22, "c_dynamic_n": 52000, "c0_static_n": 36000}
    ]

    @staticmethod
    def calculate_equivalent_load(fr_n, fa_n=0.0, v_factor=1.0, x_factor=0.56, y_factor=1.5):
        """
        คำนวณแรงรับภาระสมมูล (Equivalent Radial Load P - สไลด์หน้า 5)
        P = X * V * Fr + Y * Fa
        """
        fr = abs(float(fr_n))
        fa = abs(float(fa_n))

        if fa == 0.0:
            p_equivalent = v_factor * fr
        else:
            p_equivalent = (x_factor * v_factor * fr) + (y_factor * fa)

        return max(p_equivalent, fr)

    @staticmethod
    def calculate_bearing_life(c_rating_n, p_equivalent_n, rpm, bearing_type="ball"):
        """
        คำนวณอายุการใช้งานลูกปืน (Bearing Life L10 & L10h - สไลด์หน้า 5)
        L10 = (C / P)^k  [หน่วย: ล้านรอบ, mr]
        L10h = (10^6 / (60 * N)) * L10  [หน่วย: ชั่วโมง, hours]
        k = 3 สำหรับ Ball Bearing, k = 3.33 สำหรับ Roller Bearing
        """
        c = float(c_rating_n)
        p = float(p_equivalent_n)
        n = float(rpm)

        if p <= 0:
            raise ValueError("แรงรับภาระสมมูล (P) ต้องมากกว่า 0")
        if n <= 0:
            raise ValueError("ความเร็วรอบ (N) ต้องมากกว่า 0")

        k = 3.0 if bearing_type == "ball" else 3.333333333
        
        l10_mr = (c / p)**k  # ล้านรอบ
        l10_hours = (10.0**6 / (60.0 * n)) * l10_mr

        return {
            "c_rating_n": c,
            "p_equivalent_n": p,
            "k_exponent": k,
            "l10_million_revs": l10_mr,
            "l10_hours": l10_hours,
            "l10_years_continuous": l10_hours / (24.0 * 365.25)
        }

    @staticmethod
    def get_standard_bearing_recommendation(d_shaft_mm):
        """
        ค้นหาเบอร์ลูกปืนมาตรฐาน ISO 62xx ที่รูเพลา (bore) ตรงกับหรือใกล้เคียงขนาดเพลาที่คำนวณได้
        """
        d = float(d_shaft_mm)
        best_match = None

        for b in BearingCalculator.ISO_6200_SERIES:
            if b["bore_mm"] >= d:
                best_match = b
                break

        if best_match is None:
            best_match = BearingCalculator.ISO_6200_SERIES[-1]

        return best_match
