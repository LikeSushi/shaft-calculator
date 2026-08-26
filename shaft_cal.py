import math

class AdvancedMechanicalShaft:
    """
    คลาสคำนวณและออกแบบเพลาจักรกล (Mechanical Shaft Design & Analysis)
    ถอดถอดสมการและหลักการคำนวณจากเอกสารการสอนรายวิชา FRA232 (Structure Design)
    เรื่อง Shafts (Part 2) Sizing & Strength of Materials
    โดย ผศ.ดร.สุภชัย วงศ์บุนยง (มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี - FIBO)
    """
    ISO_STANDARD_DIAMETERS_MM = [
        6, 7, 8, 9, 10, 12, 14, 18, 20, 25, 30, 35, 40, 45, 50, 
        55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120, 130, 140, 
        150, 160, 170, 180, 190, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380
    ]

    def __init__(self, sut_mpa=None, sy_mpa=250.0, d_mm=None, g_mpa=79000.0, e_mpa=205000.0):
        self.sy = float(sy_mpa)
        self.sut = float(sut_mpa) if sut_mpa is not None else max(1.6 * self.sy, self.sy + 100.0)
        self.d = float(d_mm) if d_mm is not None else None
        self.g = float(g_mpa)
        self.e = float(e_mpa)

    @staticmethod
    def get_iso_standard_diameter(d_calculated_mm):
        for std_d in AdvancedMechanicalShaft.ISO_STANDARD_DIAMETERS_MM:
            if std_d >= d_calculated_mm:
                return std_d
        return math.ceil(d_calculated_mm)

    @staticmethod
    def calculate_torque_from_power(power_w, rpm):
        if rpm <= 0:
            raise ValueError("ความเร็วรอบ (RPM) ต้องมากกว่า 0")
        omega = (2.0 * math.pi * float(rpm)) / 60.0
        torque_nm = float(power_w) / omega
        return torque_nm

    def calculate_asme_allowable_shear(self, has_keyway=True, use_material_properties=False):
        if use_material_properties and self.sy and self.sut:
            tau_mat = min(0.3 * self.sy, 0.18 * self.sut)
            tau_d = tau_mat * 0.75 if has_keyway else tau_mat
        else:
            tau_d = 41.0 if has_keyway else 55.0
            
        return tau_d

    def calculate_buckling_factor(self, d_mm, length_mm, is_compressive=True, end_condition="SS"):
        if not is_compressive or d_mm <= 0:
            return 1.0
            
        d = float(d_mm)
        l_mm = float(length_mm)
        k_gyration = d / 4.0
        slenderness = l_mm / k_gyration
        
        n_map = {
            "SS": 1.00,
            "CC": 2.25,
            "SC": 1.60,
            "CF": 0.25
        }
        n_end = n_map.get(end_condition, 1.00)
        
        if slenderness <= 115.0:
            denom = 1.0 - (0.0044 * slenderness)
            alpha = 1.0 / max(denom, 0.01)
        else:
            alpha = (self.sy * (slenderness**2)) / ((math.pi**2) * n_end * self.e)
            
        return alpha

    def calculate_vm_diagram(self, length_mm, load_n, position_a_mm):
        """
        คำนวณแผนภาพแรงเฉือน (V) และโมเมนต์ดัด (M) สำหรับเพลารับแรงจุด (Point Load) บนจุดรองรับสองฝั่ง
        L: ความยาวเพลา (mm)
        W: แรงกระทำทางขวาง (N)
        a: ระยะแรงกระทำจากจุดยึดซ้าย (mm)
        """
        L = max(float(length_mm), 1.0)
        W = float(load_n)
        a = min(max(float(position_a_mm), 0.0), L)
        b = L - a

        # แรงปฏิกิริยาที่จุดรองรับ A และ B
        ra = (W * b) / L
        rb = (W * a) / L

        # แรงเฉือนสูงสุด V_max (N) และโมเมนต์ดัดสูงสุด M_max (N-mm)
        v_max = max(abs(ra), abs(rb))
        m_max_nmm = ra * a  # หรือ rb * b
        m_max_nm = m_max_nmm / 1000.0

        return {
            "L_mm": L,
            "W_n": W,
            "a_mm": a,
            "b_mm": b,
            "ra_n": ra,
            "rb_n": rb,
            "v_max_n": v_max,
            "m_max_nmm": m_max_nmm,
            "m_max_nm": m_max_nm
        }

    def asme_shaft_design(self, torque_nmm, bending_moment_nmm, axial_force_n=0.0, length_mm=100.0, 
                          is_compressive=True, end_condition="SS", is_rotating=True, load_type="steady", 
                          has_keyway=True, use_material_properties=False, cm_custom=None, ct_custom=None):
        """
        คำนวณขนาดเพลาตามมาตรฐาน ASME (รองรับการกำหนด Cm, Ct เองได้อิสระ)
        """
        if cm_custom is not None and ct_custom is not None:
            cm, ct = float(cm_custom), float(ct_custom)
        else:
            if not is_rotating:
                if load_type == "steady":
                    cm, ct = 1.0, 1.0
                else:
                    cm, ct = 1.75, 1.75
            else:
                if load_type == "steady":
                    cm, ct = 1.5, 1.0
                elif load_type == "light_shock":
                    cm, ct = 1.75, 1.25
                else:
                    cm, ct = 2.5, 2.25

        tau_d = self.calculate_asme_allowable_shear(has_keyway=has_keyway, use_material_properties=use_material_properties)
        f_axial = abs(float(axial_force_n))
        
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
        d = float(d_mm) if d_mm is not None else self.d
        if d is None or d <= 0:
            raise ValueError("ต้องระบุขนาดเส้นผ่านศูนย์กลางเพลา (d_mm)")
            
        i_inertia = (math.pi * (d**4)) / 64.0
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
        d = float(d_mm) if d_mm is not None else self.d
        if d is None or d <= 0:
            raise ValueError("ต้องระบุขนาดเส้นผ่านศูนย์กลางเพลา (d_mm)")
            
        m_a = float(m_a_nm) * 1000.0
        t_m = float(t_m_nm) * 1000.0
        
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