import math

class GearCalculator:
    """
    คลาสคำนวณเรขาคณิตและความแข็งแรงของเฟืองตรง (Spur Gear Geometry & Lewis Strength)
    ถอดถอดสมการและหลักการคำนวณจากเอกสารการสอนรายวิชา FRA232 (Structure Design)
    เรื่อง Gears (Part 1 & 2) โดย ผศ.ดร.สุภชัย วงศ์บุนยง (FIBO, KMUTT)
    """

    @staticmethod
    def calculate_lewis_form_factor(teeth_count):
        """
        ประมาณค่า Lewis Form Factor (y) ตามจำนวนฟันเฟือง (Z) สำหรับ Pressure Angle 20 องศา (สไลด์ Week 07)
        """
        z = int(teeth_count)
        if z <= 12: return 0.067
        elif z <= 15: return 0.092
        elif z <= 18: return 0.100
        elif z <= 22: return 0.104
        elif z <= 28: return 0.112
        elif z <= 35: return 0.118
        elif z <= 45: return 0.125
        elif z <= 60: return 0.130
        else: return 0.134

    @staticmethod
    def calculate_spur_gear_geometry(module, teeth_pinion, teeth_gear):
        """
        คำนวณเรขาคณิตเฟืองตรง (Spur Gear Geometry - สไลด์ Week 06)
        - d1 = m * Z1  [หน่วย mm]
        - d2 = m * Z2  [หน่วย mm]
        - Center Distance a = (d1 + d2) / 2
        - Circular Pitch p = pi * m
        - Gear Ratio i = Z2 / Z1
        """
        m = float(module)
        z1 = int(teeth_pinion)
        z2 = int(teeth_gear)

        if m <= 0 or z1 <= 0 or z2 <= 0:
            raise ValueError("โมดูล (m) และจำนวนฟันเฟือง (Z) ต้องมากกว่า 0")

        d1 = m * z1
        d2 = m * z2
        a = (d1 + d2) / 2.0
        p = math.pi * m
        i_ratio = z2 / float(z1)

        return {
            "module": m,
            "teeth_pinion": z1,
            "teeth_gear": z2,
            "d1_pinion_mm": d1,
            "d2_gear_mm": d2,
            "center_distance_mm": a,
            "circular_pitch_mm": p,
            "gear_ratio": i_ratio
        }

    @staticmethod
    def calculate_gear_forces(power_w, rpm, pitch_diameter_mm, pressure_angle_deg=20.0):
        """
        คำนวณแรงที่ฟันเฟือง (Gear Forces - สไลด์ Week 06 & 07)
        - แรงบิด T = P / omega  [N-m]
        - แรงสัมผัส WT = 2000 * T / d1  [N]
        - แรงในแนวรัศมี WR = WT * tan(phi)  [N]
        """
        p = float(power_w)
        n = float(rpm)
        d1 = float(pitch_diameter_mm)
        phi_rad = math.radians(float(pressure_angle_deg))

        if n <= 0 or d1 <= 0:
            raise ValueError("ความเร็วรอบ (N) และขนาด Pitch Diameter (d1) ต้องมากกว่า 0")

        omega = (2.0 * math.pi * n) / 60.0
        t_nm = p / omega
        wt_n = (2000.0 * t_nm) / d1
        wr_n = wt_n * math.tan(phi_rad)
        w_resultant = math.sqrt(wt_n**2 + wr_n**2)

        return {
            "power_w": p,
            "rpm": n,
            "torque_nm": t_nm,
            "wt_tangential_n": wt_n,
            "wr_radial_n": wr_n,
            "w_resultant_n": w_resultant
        }

    @staticmethod
    def calculate_lewis_bending_strength(module, face_width_mm, teeth_pinion, allowable_stress_mpa=140.0):
        """
        คำนวณแรงที่ยอมให้ตามสมการความเค้นดัดลูอิส (Lewis Bending Stress Equation - สไลด์ Week 07)
        WT_allow = sigma_b * b * pi * m * y
        """
        m = float(module)
        b = float(face_width_mm)
        z1 = int(teeth_pinion)
        sigma_b = float(allowable_stress_mpa)

        y_factor = GearCalculator.calculate_lewis_form_factor(z1)
        wt_allowable_n = sigma_b * b * math.pi * m * y_factor

        return {
            "module": m,
            "face_width_mm": b,
            "teeth_pinion": z1,
            "lewis_y_factor": y_factor,
            "allowable_stress_mpa": sigma_b,
            "wt_allowable_n": wt_allowable_n
        }
