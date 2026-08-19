import math

class AdvancedMechanicalShaft:
    """
    คลาสคำนวณและออกแบบเพลาจักรกล (Mechanical Shaft Design & Analysis)
    ถอดถอดสมการและหลักการคำนวณจากเอกสารการสอนรายวิชา FRA232 (Structure Design)
    เรื่อง Shafts (Part 2) Sizing & Strength of Materials
    โดย ผศ.ดร.สุภชัย วงศ์บุนยง (มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี - FIBO)
    """
    # ตารางขนาดระบุของเพลาตามมาตรฐาน ISO/R 775-1969 (ตารางที่ 9.1 ในชีทเรียน หน้า 21)
    ISO_STANDARD_DIAMETERS_MM = [
        6, 7, 8, 9, 10, 12, 14, 18, 20, 25, 30, 35, 40, 45, 50, 
        55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120, 130, 140, 
        150, 160, 170, 180, 190, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380
    ]

    def __init__(self, sut_mpa=None, sy_mpa=250.0, d_mm=None, g_mpa=79000.0, e_mpa=205000.0):
        """
        sy_mpa: Yield Strength (MPa) [ค่าเริ่มต้น 250 MPa]
        sut_mpa: Ultimate Tensile Strength (MPa) [ถ้าไม่ระบุ จะประมาณ 1.6 * Sy]
        d_mm: ขนาดเส้นผ่านศูนย์กลางเพลา (mm)
        g_mpa: Modulus of Rigidity (MPa) [ค่าเริ่มต้น 79,000 MPa สำหรับเหล็กกล้า]
        e_mpa: Modulus of Elasticity / Young's Modulus (MPa) [ค่าเริ่มต้น 205,000 MPa สำหรับเหล็กกล้า]
        """
        self.sy = float(sy_mpa)
        self.sut = float(sut_mpa) if sut_mpa is not None else max(1.6 * self.sy, self.sy + 100.0)
        self.d = float(d_mm) if d_mm is not None else None
        self.g = float(g_mpa)
        self.e = float(e_mpa)

    @staticmethod
    def get_iso_standard_diameter(d_calculated_mm):
        """
        เลือกขนาดเพลามาตรฐาน ISO/R 775-1969 ถัดไปที่ใหญ่กว่าหรือเท่ากับค่าที่คำนวณได้ (ตาราง 9.1 หน้า 21)
        """
        for std_d in AdvancedMechanicalShaft.ISO_STANDARD_DIAMETERS_MM:
            if std_d >= d_calculated_mm:
                return std_d
        return math.ceil(d_calculated_mm)

    @staticmethod
    def calculate_torque_from_power(power_w, rpm):
        """
        คำนวณแรงบิด (Torque, T) ในหน่วย N-m หรือ N-mm จากกำลังมอเตอร์ (Watt) และความเร็วรอบ (RPM)
        P = T * omega  =>  T = P / (2 * pi * N / 60)
        """
        if rpm <= 0:
            raise ValueError("ความเร็วรอบ (RPM) ต้องมากกว่า 0")
        omega = (2.0 * math.pi * float(rpm)) / 60.0
        torque_nm = float(power_w) / omega
        return torque_nm

    def calculate_asme_allowable_shear(self, has_keyway=True, use_material_properties=False):
        """
        คำนวณความเค้นเฉือนที่ยอมให้ (Allowable Shear Stress, tau_d) ตามมาตรฐาน ASME (หน้า 26 ในชีทเรียน)
        - หากใช้ค่ามาตรฐาน ASME (Default): 
            * ไม่มีร่องลิ่ม: tau_d = 55 N/mm^2 (MPa)
            * มีร่องลิ่ม:   tau_d = 41 N/mm^2 (MPa)
        - หากระบุชนิดวัสดุ (If material type specified):
            * tau_d = min(0.3 * Sy, 0.18 * Sut)
            * หากมีร่องลิ่ม ให้ลดค่าลง 25% (คูณ 0.75)
        """
        if use_material_properties and self.sy and self.sut:
            tau_mat = min(0.3 * self.sy, 0.18 * self.sut)
            tau_d = tau_mat * 0.75 if has_keyway else tau_mat
        else:
            tau_d = 41.0 if has_keyway else 55.0
            
        return tau_d

    def calculate_buckling_factor(self, d_mm, length_mm, is_compressive=True, end_condition="SS"):
        """
        คำนวณ Buckling Factor (alpha) สำหรับแรงอัดในแนวแกน ตามมาตรฐาน ASME (หน้า 28 ในชีทเรียน)
        - แรงดึง (Tensile): alpha = 1.0
        - แรงอัด (Compressive):
            * k = d / 4 (Radius of gyration เพลาตัน)
            * Slenderness Ratio L/k = 4 * L / d
            * ถ้า L/k <= 115: alpha = 1 / (1 - 0.0044 * (L/k))
            * ถ้า L/k > 115:  alpha = (Sy * (L/k)^2) / (pi^2 * n * E)
              โดยที่ n = 1.00 (SS), 2.25 (CC), 1.60 (SC), 0.25 (CF)
        """
        if not is_compressive or d_mm <= 0:
            return 1.0
            
        d = float(d_mm)
        l_mm = float(length_mm)
        k_gyration = d / 4.0
        slenderness = l_mm / k_gyration
        
        n_map = {
            "SS": 1.00,  # Simply Supported
            "CC": 2.25,  # Clamped-Clamped (Fixed-Fixed)
            "SC": 1.60,  # Simply Supported - Clamped
            "CF": 0.25   # Clamped-Free
        }
        n_end = n_map.get(end_condition, 1.00)
        
        if slenderness <= 115.0:
            denom = 1.0 - (0.0044 * slenderness)
            alpha = 1.0 / max(denom, 0.01)
        else:
            alpha = (self.sy * (slenderness**2)) / ((math.pi**2) * n_end * self.e)
            
        return alpha

    def asme_shaft_design(self, torque_nmm, bending_moment_nmm, axial_force_n=0.0, length_mm=100.0, is_compressive=True, end_condition="SS", is_rotating=True, load_type="steady", has_keyway=True, use_material_properties=False):
        """
        คำนวณขนาดเพลาตามมาตรฐาน ASME (ASME Shaft Design Full & Simplified Form - หน้า 25 & 28 ในชีทเรียน)
        สมการแบบเต็ม (Full Form):
        d^3 = (16 / (pi * tau_d)) * sqrt((C_t * T)^2 + ( (alpha * F * d) / 8 + C_m * M )^2)

        พารามิเตอร์:
        - torque_nmm: แรงบิด T (N-mm)
        - bending_moment_nmm: โมเมนต์ดัดรวม M (N-mm)
        - axial_force_n: แรงในแนวแกน F (N) [ค่าบวก, 0 ถ้าไม่มี]
        - length_mm: ความยาวเพลา (mm)
        - is_compressive: True ถ้าแรง F เป็นแรงอัด (Compressive), False ถ้าเป็นแรงดึง
        - end_condition: ประเภทจุดยึดปลายเพลา "SS" (Simply Supported), "CC" (Clamped-Clamped), "SC", "CF"
        """
        # อ่านค่า Cm และ Ct จากตารางที่ 9.2 ในชีทเรียน (หน้า 27)
        if not is_rotating:  # เพลาอยู่นิ่ง
            if load_type == "steady":
                cm, ct = 1.0, 1.0
            else:  # shock load
                cm, ct = 1.75, 1.75
        else:  # เพลาหมุน
            if load_type == "steady":
                cm, ct = 1.5, 1.0
            elif load_type == "light_shock":
                cm, ct = 1.75, 1.25
            else:  # heavy_shock
                cm, ct = 2.5, 2.25

        tau_d = self.calculate_asme_allowable_shear(has_keyway=has_keyway, use_material_properties=use_material_properties)
        f_axial = abs(float(axial_force_n))
        
        # วนลูปคำนวณหา d_calc แบบ Iterative Solver (เนื่องจาก d อยู่ทั้งสองฝั่งของสมการเมื่อมีแรง F)
        d_curr = 10.0
        alpha = 1.0
        
        for _ in range(50):
            if f_axial > 0:
                alpha = self.calculate_buckling_factor(d_curr, length_mm, is_compressive=is_compressive, end_condition=end_condition)
                axial_term = (alpha * f_axial * d_curr) / 8.0
            else:
                axial_term = 0.0
                
            bending_total = axial_term + (cm * float(bending_moment_nmm))
            equivalent_term = math.sqrt((ct * float(torque_nmm))**2 + (bending_total**2))
            d3 = (16.0 / (math.pi * tau_d)) * equivalent_term
            d_next = d3**(1.0 / 3.0)
            
            if abs(d_next - d_curr) < 1e-4:
                d_curr = d_next
                break
            d_curr = d_next

        d_calc = d_curr
        d_standard = self.get_iso_standard_diameter(d_calc)

        return {
            "cm": cm,
            "ct": ct,
            "alpha": alpha,
            "tau_d_mpa": tau_d,
            "axial_force_n": f_axial,
            "equivalent_term_nmm": equivalent_term,
            "d_calculated_mm": d_calc,
            "d_standard_iso_mm": d_standard
        }

    def calculate_torsional_deflection(self, torque_nmm, length_mm, d_mm=None, d_inner_mm=0.0):
        """
        คำนวณมุมบิดเพลา (Twisted Angle Calculation - หัวข้อ 2.5 ในชีทเรียน หน้า 29)
        เพลากลมตัน:  theta = (584 * T * L) / (G * d^4)
        เพลากลมกลวง: theta = (584 * T * L) / ((1 - K^4) * G * d^4)  โดยที่ K = d_i / d
        """
        d = float(d_mm) if d_mm is not None else self.d
        if d is None or d <= 0:
            raise ValueError("ต้องระบุขนาดเส้นผ่านศูนย์กลางเพลา (d_mm)")
            
        t_nmm = float(torque_nmm)
        l_mm = float(length_mm)
        
        if d_inner_mm > 0:
            k = float(d_inner_mm) / d
            theta_deg = (584.0 * t_nmm * l_mm) / ((1.0 - k**4) * self.g * (d**4))
        else:
            theta_deg = (584.0 * t_nmm * l_mm) / (self.g * (d**4))
            
        theta_rad = math.radians(theta_deg)
        theta_deg_per_m = theta_deg * (1000.0 / l_mm)

        return {
            "d_mm": d,
            "theta_deg": theta_deg,
            "theta_rad": theta_rad,
            "theta_deg_per_m": theta_deg_per_m
        }

    def calculate_critical_speed(self, loads_n, distances_mm, total_length_mm, d_mm=None):
        """
        คำนวณความเร็ววิกฤตของเพลา (Critical Speed - หัวข้อ 2.7 ในชีทเรียน หน้า 51-53)
        สูตร Rayleigh-Dunkerley (หน้า 52):
        n_c = 945 * sqrt( sum(W_i * y_i) / sum(W_i * y_i^2) )  [หน่วย rpm]
        """
        d = float(d_mm) if d_mm is not None else self.d
        if d is None or d <= 0:
            raise ValueError("ต้องระบุขนาดเส้นผ่านศูนย์กลางเพลา (d_mm)")
            
        i_inertia = (math.pi * (d**4)) / 64.0  # Moment of Inertia (mm^4)
        
        sum_wy = 0.0
        sum_wy2 = 0.0
        deflections_mm = []

        for w, x in zip(loads_n, distances_mm):
            y = (float(w) * (float(total_length_mm)**3)) / (48.0 * self.e * i_inertia)
            deflections_mm.append(y)
            sum_wy += float(w) * y
            sum_wy2 += float(w) * (y**2)

        if sum_wy2 <= 0:
            raise ValueError("ค่าผลรวมความโก่งตัวไม่ถูกต้อง")

        nc_rpm = 945.0 * math.sqrt(sum_wy / sum_wy2)

        return {
            "i_inertia_mm4": i_inertia,
            "deflections_mm": deflections_mm,
            "nc_rpm": nc_rpm,
            "safe_operating_range_rpm": (0.75 * nc_rpm, 1.25 * nc_rpm)
        }

    def fatigue_analysis(self, m_a_nm, t_m_nm, kt=1.0, kts=1.0, d_mm=None):
        """
        คำนวณ Safety Factor สำหรับความล้า (Fatigue - Modified Goodman) และ Static Yield (Von Mises)
        """
        d = float(d_mm) if d_mm is not None else self.d
        if d is None or d <= 0:
            raise ValueError("ต้องระบุขนาดเส้นผ่านศูนย์กลางเพลา (d_mm)")
            
        m_a = float(m_a_nm) * 1000.0  # N-mm
        t_m = float(t_m_nm) * 1000.0  # N-mm
        
        se_prime = 0.5 * self.sut if self.sut <= 1400 else 700.0
        ka = 4.51 * (self.sut)**(-0.265)
        kb = 1.24 * (d)**(-0.107) if 2.79 <= d <= 51 else (1.51 * (d)**(-0.157) if 51 < d <= 254 else 1.0)
        se = ka * kb * se_prime
        
        q = 0.8
        kf = 1.0 + q * (float(kt) - 1.0)
        
        sigma_a_prime = kf * (32.0 * m_a) / (math.pi * d**3)
        tau_m = (16.0 * t_m) / (math.pi * d**3)
        sigma_m_prime = math.sqrt(3.0) * tau_m
        
        inv_n = (sigma_a_prime / se) + (sigma_m_prime / self.sut)
        n_goodman = 1.0 / inv_n
        
        sigma_max_von_mises = math.sqrt(sigma_a_prime**2 + sigma_m_prime**2)
        n_yield = self.sy / sigma_max_von_mises
        
        return n_goodman, n_yield