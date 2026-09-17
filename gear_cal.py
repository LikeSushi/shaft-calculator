import math

class GearCalculator:
    """
    คลาสคำนวณและออกแบบเฟืองตรงแบบสมบูรณ์ (Comprehensive Spur Gear Design & Selection)
    ถอดถอดสมการและตารางอ้างอิงจากไฟล์ FRA232 Gear Design & Selection Calculations.xlsx
    วิชา FRA232 (Structure Design) โดย ผศ.ดร.สุภชัย วงศ์บุนยง (FIBO, KMUTT)
    """

    # ตารางค่า Endurance Strength sigma (N/mm^2) และความแข็ง Brinell (HB) (Table 2.5)
    MATERIAL_STRENGTH_TABLE = {
        "ASTM_25_GREY_CAST": {"name": "ASTM 25 Grey Cast Iron", "sigma": 55.0, "hb": 174},
        "ASTM_35_GREY_CAST": {"name": "ASTM 35 Grey Cast Iron", "sigma": 82.0, "hb": 212},
        "ASTM_50_GREY_CAST": {"name": "ASTM 50 Grey Cast Iron", "sigma": 103.0, "hb": 223},
        "CAST_STEEL_02C_UNTREATED": {"name": "Cast steel 0.2% C untreated", "sigma": 138.0, "hb": 180},
        "CAST_STEEL_02C_WQT": {"name": "Cast steel 0.2% C WQT", "sigma": 172.0, "hb": 250},
        "SAE_1020_CASE_HARDENED": {"name": "SAE 1020 Case Hardened & WQT", "sigma": 124.0, "hb": 156},
        "SAE_1030_UNTREATED": {"name": "SAE 1030 untreated", "sigma": 138.0, "hb": 180},
        "SAE_1035_UNTREATED": {"name": "SAE 1035 untreated", "sigma": 159.0, "hb": 190},
        "SAE_1040_UNTREATED": {"name": "SAE 1040 untreated", "sigma": 172.0, "hb": 202},
        "SAE_1045_UNTREATED": {"name": "SAE 1045 untreated", "sigma": 207.0, "hb": 215},
        "SAE_1045_WQT": {"name": "SAE 1045 WQT", "sigma": 220.0, "hb": 205},
        "SAE_2320_CASE_HARDENED": {"name": "SAE 2320 Case Hardened & WQT", "sigma": 345.0, "hb": 225},
        "SAE_4340_OQT": {"name": "SAE 4340 OQT", "sigma": 448.0, "hb": 475}
    }

    # ตารางค่า Lewis Form Factor (Y) ตามระบบมุมกด Pressure Angle (Table 2.4)
    LEWIS_Y_TABLE_20_FD = {
        10: 0.201, 11: 0.226, 12: 0.245, 13: 0.264, 14: 0.276, 15: 0.289, 16: 0.295, 17: 0.302,
        18: 0.308, 19: 0.314, 20: 0.320, 25: 0.340, 30: 0.358, 35: 0.373, 40: 0.389, 50: 0.408,
        60: 0.421, 100: 0.446, 150: 0.458, 200: 0.463
    }

    @staticmethod
    def lookup_lewis_y_factor(teeth_count, pressure_angle_deg=20.0, system="FD"):
        """
        ค้นหาค่า Lewis Form Factor (Y) จากจำนวนฟันเฟือง
        """
        z = int(teeth_count)
        keys = sorted(GearCalculator.LEWIS_Y_TABLE_20_FD.keys())
        
        if z in GearCalculator.LEWIS_Y_TABLE_20_FD:
            return GearCalculator.LEWIS_Y_TABLE_20_FD[z]
        
        # Linear interpolation or nearest match
        for i in range(len(keys) - 1):
            if keys[i] <= z <= keys[i+1]:
                k1, k2 = keys[i], keys[i+1]
                y1, y2 = GearCalculator.LEWIS_Y_TABLE_20_FD[k1], GearCalculator.LEWIS_Y_TABLE_20_FD[k2]
                return y1 + (y2 - y1) * (z - k1) / (k2 - k1)
        
        if z < keys[0]: return GearCalculator.LEWIS_Y_TABLE_20_FD[keys[0]]
        return GearCalculator.LEWIS_Y_TABLE_20_FD[keys[-1]]

    @staticmethod
    def calculate_full_gear_design(power_w, rpm_pinion, gear_ratio, teeth_pinion, module, face_width_ratio=10.0,
                                    sigma_p=103.0, sigma_g=82.0, kf=1.5, wear_k=1.182, profile_quality="ordinary"):
        """
        คำนวณการออกแบบเฟืองตรงแบบสมบูรณ์ถอดแบบตรงจากไฟล์ Excel "FRA232 Gear Design & Selection Calculations.xlsx"
        """
        pw = float(power_w)
        np = float(rpm_pinion)
        mw = float(gear_ratio)
        Np = int(teeth_pinion)
        m = float(module)
        kb = float(face_width_ratio)
        kf_factor = float(kf)
        k_wear = float(wear_k)

        Ng = int(round(Np * mw))
        dp = m * Np
        dg = m * Ng
        b = kb * m
        C_center = (dp + dg) / 2.0

        # Pitch Line Velocity V (m/s)
        V = (math.pi * dp * np) / (60.0 * 1000.0)

        # Tangential Force Ft (N)
        Ft = pw / V if V > 0 else 0.0

        # Velocity Factor Kv
        if profile_quality == "ordinary":
            Kv = (3.0 + V) / 3.0
        elif profile_quality == "cut":
            Kv = (6.0 + V) / 6.0
        else:
            Kv = (5.6 + math.sqrt(V)) / 5.6

        # Dynamic Load Fd (N)
        Fd = Ft * Kv

        # Lewis Form Factors Yp and Yg
        Yp = GearCalculator.lookup_lewis_y_factor(Np)
        Yg = GearCalculator.lookup_lewis_y_factor(Ng)

        # Strength Indexes
        index_p = sigma_p * Yp
        index_g = sigma_g * Yg
        weaker_component = "Pinion governs" if index_p <= index_g else "Gear governs"

        # Bending Strengths Fb (N)  -- Fb = (sigma * b * m * Y) / Kf
        Fb_pinion = (sigma_p * b * m * Yp) / kf_factor
        Fb_gear = (sigma_g * b * m * Yg) / kf_factor
        Fb_governing = min(Fb_pinion, Fb_gear)

        # Service Factors Ns = Fb / Fd
        Ns_pinion = Fb_pinion / Fd if Fd > 0 else 99.0
        Ns_gear = Fb_gear / Fd if Fd > 0 else 99.0
        Ns_governing = min(Ns_pinion, Ns_gear)

        # Wear ratio factor Q = (2 * Ng) / (Np + Ng)
        Q = (2.0 * Ng) / (Np + Ng)

        # Allowable Wear Load Fw = dp * b * Q * K
        Fw = dp * b * Q * k_wear

        # Safety & Design Criteria Verdicts
        pinion_bending_pass = Fb_pinion >= Fd
        gear_bending_pass = Fb_gear >= Fd
        governing_bending_pass = Fb_governing >= Fd
        wear_safe_pass = Fw >= Fd
        overall_pass = governing_bending_pass and wear_safe_pass

        return {
            "power_w": pw,
            "rpm_pinion": np,
            "gear_ratio": mw,
            "teeth_pinion": Np,
            "teeth_gear": Ng,
            "module_mm": m,
            "face_width_mm": b,
            "dp_pinion_mm": dp,
            "dg_gear_mm": dg,
            "center_distance_mm": C_center,
            "velocity_m_s": V,
            "tangential_force_ft_n": Ft,
            "velocity_factor_kv": Kv,
            "dynamic_load_fd_n": Fd,
            "lewis_yp": Yp,
            "lewis_yg": Yg,
            "index_p": index_p,
            "index_g": index_g,
            "weaker_component": weaker_component,
            "fb_pinion_n": Fb_pinion,
            "fb_gear_n": Fb_gear,
            "fb_governing_n": Fb_governing,
            "ns_pinion": Ns_pinion,
            "ns_gear": Ns_gear,
            "ns_governing": Ns_governing,
            "wear_q": Q,
            "wear_load_fw_n": Fw,
            "pinion_bending_pass": pinion_bending_pass,
            "gear_bending_pass": gear_bending_pass,
            "governing_bending_pass": governing_bending_pass,
            "wear_safe_pass": wear_safe_pass,
            "overall_pass": overall_pass
        }

    @staticmethod
    def generate_module_trial_matrix(power_w, rpm_pinion, gear_ratio, teeth_pinion, face_width_ratio=10.0,
                                     sigma_p=103.0, sigma_g=82.0, kf=1.5, wear_k=1.182):
        """
        สร้างตารางทดลองค่าโมดูล (Module Trial Matrix) m = 2.0 ถึง 9.0 mm แบบเดียวกับในไฟล์ Excel Sheet 2
        """
        modules = [2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0]
        trial_results = []

        for m in modules:
            res = GearCalculator.calculate_full_gear_design(
                power_w=power_w, rpm_pinion=rpm_pinion, gear_ratio=gear_ratio, teeth_pinion=teeth_pinion,
                module=m, face_width_ratio=face_width_ratio, sigma_p=sigma_p, sigma_g=sigma_g, kf=kf, wear_k=wear_k
            )
            trial_results.append({
                "module": m,
                "face_width_mm": res["face_width_mm"],
                "dp_mm": res["dp_pinion_mm"],
                "velocity_m_s": res["velocity_m_s"],
                "ft_n": res["tangential_force_ft_n"],
                "kv": res["velocity_factor_kv"],
                "fd_n": res["dynamic_load_fd_n"],
                "fb_pinion_n": res["fb_pinion_n"],
                "fb_gear_n": res["fb_gear_n"],
                "fb_governing_n": res["fb_governing_n"],
                "ns": res["ns_governing"],
                "fw_n": res["wear_load_fw_n"],
                "bending_safe": "Yes" if res["governing_bending_pass"] else "No",
                "wear_safe": "Yes" if res["wear_safe_pass"] else "No",
                "design_verdict": "Safe" if res["overall_pass"] else "Unsafe"
            })

        return trial_results
