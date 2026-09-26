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
        return self.calculate_multi_load_vm_diagram(
            length_mm=length_mm,
            loads=[{"w_n": -abs(load_n), "x_mm": position_a_mm}],
            beam_type="ss"
        )

    def calculate_multi_load_vm_diagram(self, length_mm, loads, beam_type="ss", xa_mm=0.0, xb_mm=None):
        """
        คำนวณแผนภาพ V-M ตามระบบพิกัดฉาก 2D (X -> ความยาวเพลา, Y -> ทิศทางแรง +Y ขึ้น, -Y ลง)
        - loads: รายการแรงเวกเตอร์ [{"w_n": -500, "x_mm": 30}, {"w_n": +200, "x_mm": 70}]
        - beam_type: "ss" (Simply Supported), "cantilever" (คานยื่นยึดแน่นซ้าย), "overhanging" (คานยื่นพาดเรียบ)
        """
        L = max(float(length_mm), 1.0)
        xa = float(xa_mm)
        xb = float(xb_mm) if xb_mm is not None else L

        parsed_loads = []
        for load in loads:
            w = float(load.get("w_n", 0.0))
            x = min(max(float(load.get("x_mm", 0.0)), 0.0), L)
            if abs(w) > 0:
                parsed_loads.append({"w_n": w, "x_mm": x})

        total_w = sum(l["w_n"] for l in parsed_loads)
        ma_fixed = 0.0
        ra, rb = 0.0, 0.0

        if beam_type == "cantilever":
            ra = -total_w
            rb = 0.0
            ma_fixed = sum(l["w_n"] * (l["x_mm"] - xa) for l in parsed_loads)
        else:
            span = max(xb - xa, 1.0)
            rb = -sum(l["w_n"] * (l["x_mm"] - xa) for l in parsed_loads) / span
            ra = -total_w - rb

        num_points = 200
        x_points = [ (i * L) / num_points for i in range(num_points + 1) ]
        v_points = []
        m_points = []

        for x in x_points:
            term_ra = ra if x >= xa else 0.0
            term_rb = rb if x >= xb else 0.0
            term_w = sum(l["w_n"] for l in parsed_loads if l["x_mm"] <= x)
            v_x = term_ra + term_rb + term_w

            m_fixed_term = ma_fixed if x >= xa else 0.0
            m_ra = ra * max(x - xa, 0.0)
            m_rb = rb * max(x - xb, 0.0)
            m_w = sum(l["w_n"] * (x - l["x_mm"]) for l in parsed_loads if l["x_mm"] <= x)
            m_x = m_fixed_term + m_ra + m_rb + m_w

            v_points.append(v_x)
            m_points.append(m_x)

        v_max = max((abs(v) for v in v_points), default=0.0)
        m_max_nmm = max((abs(m) for m in m_points), default=0.0)
        m_max_nm = m_max_nmm / 1000.0

        return {
            "L_mm": L,
            "beam_type": beam_type,
            "xa_mm": xa,
            "xb_mm": xb,
            "loads": parsed_loads,
            "ra_n": ra,
            "rb_n": rb,
            "ma_fixed_nmm": ma_fixed,
            "v_max_n": v_max,
            "m_max_nmm": m_max_nmm,
            "m_max_nm": m_max_nm,
            "x_points": x_points,
            "v_points": v_points,
            "m_points": m_points
        }

    def calculate_3d_vm_diagram(self, length_mm, loads_xy, loads_xz, beam_type="ss", xa_mm=0.0, xb_mm=None):
        """
        คำนวณแผนภาพ V-M 3 มิติ (3D Dual-Plane System: XY Vertical & XZ Horizontal)
        และคำนวณการรวมเวกเตอร์ลัพธ์ (Resultant Vectors: V_total = sqrt(Vy^2 + Vz^2), M_total = sqrt(My^2 + Mz^2))
        """
        res_xy = self.calculate_multi_load_vm_diagram(length_mm, loads_xy, beam_type=beam_type, xa_mm=xa_mm, xb_mm=xb_mm)
        res_xz = self.calculate_multi_load_vm_diagram(length_mm, loads_xz, beam_type=beam_type, xa_mm=xa_mm, xb_mm=xb_mm)

        ra_3d = math.sqrt(res_xy["ra_n"]**2 + res_xz["ra_n"]**2)
        rb_3d = math.sqrt(res_xy["rb_n"]**2 + res_xz["rb_n"]**2)
        ma_fixed_3d = math.sqrt(res_xy["ma_fixed_nmm"]**2 + res_xz["ma_fixed_nmm"]**2)

        v_points_res = [ math.sqrt(vy**2 + vz**2) for vy, vz in zip(res_xy["v_points"], res_xz["v_points"]) ]
        m_points_res = [ math.sqrt(my**2 + mz**2) for my, mz in zip(res_xy["m_points"], res_xz["m_points"]) ]

        v_max_res = max(v_points_res, default=0.0)
        m_max_nmm_res = max(m_points_res, default=0.0)
        m_max_nm_res = m_max_nmm_res / 1000.0

        return {
            "res_xy": res_xy,
            "res_xz": res_xz,
            "ra_3d_n": ra_3d,
            "rb_3d_n": rb_3d,
            "ma_fixed_3d_nmm": ma_fixed_3d,
            "v_max_res_n": v_max_res,
            "m_max_res_nmm": m_max_nmm_res,
            "m_max_res_nm": m_max_nm_res,
            "x_points": res_xy["x_points"],
            "v_points_res": v_points_res,
            "m_points_res": m_points_res
        }

    def asme_shaft_design(self, torque_nmm, bending_moment_nmm, axial_force_n=0.0, length_mm=100.0, 
                          is_compressive=True, end_condition="SS", is_rotating=True, load_type="steady", 
                          has_keyway=True, use_material_properties=False, cm_custom=None, ct_custom=None):
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

    def calculate_critical_speed(self, loads_n, distances_mm, total_length_mm, d_mm=None, e_mpa=None):
        d = float(d_mm) if d_mm is not None else self.d
        if d is None or d <= 0:
            raise ValueError("ต้องระบุขนาดเส้นผ่านศูนย์กลางเพลา (d_mm)")
            
        e_val = float(e_mpa) if e_mpa is not None else self.e
        i_inertia = (math.pi * (d**4)) / 64.0
        sum_wy = 0.0
        sum_wy2 = 0.0
        deflections_mm = []

        for w, x in zip(loads_n, distances_mm):
            y = (float(w) * (float(total_length_mm)**3)) / (48.0 * e_val * i_inertia)
            deflections_mm.append(y)
            sum_wy += float(w) * y
            sum_wy2 += float(w) * (y**2)

        if sum_wy2 <= 0:
            raise ValueError("ค่าผลรวมความโก่งตัวไม่ถูกต้อง")

        nc_factor = (30.0 / math.pi) * math.sqrt(9810.0) # 945.7335
        nc_rpm = nc_factor * math.sqrt(sum_wy / sum_wy2)

        return {
            "i_inertia_mm4": i_inertia,
            "deflections_mm": deflections_mm,
            "nc_rpm": nc_rpm,
            "safe_operating_range_rpm": (0.75 * nc_rpm, 1.25 * nc_rpm)
        }

    def calculate_3d_critical_speed(self, loads_xy, loads_xz, length_mm, xa_mm=0.0, xb_mm=None, d_mm=None, e_mpa=None):
        """
        คำนวณความเร็วรอบวิกฤต 3 มิติ (3D Dual-Plane Vector Critical Speed)
        โดยคำนวณระยะแอ่นตัวแบบเวกเตอร์ 3 มิติ Y_total = sqrt(Y_xy^2 + Y_xz^2)
        """
        d = float(d_mm) if d_mm is not None else self.d
        if d is None or d <= 0:
            raise ValueError("ต้องระบุขนาดเส้นผ่านศูนย์กลางเพลา (d_mm)")

        e_val = float(e_mpa) if e_mpa is not None else self.e
        i_inertia = (math.pi * (d**4)) / 64.0
        L = float(length_mm)
        xa = float(xa_mm)
        xb = float(xb_mm) if xb_mm is not None else L
        span = max(xb - xa, 1.0)

        y_xy_total = 0.0
        for load in loads_xy:
            w = float(load.get("w_n", 0.0))
            x = float(load.get("x_mm", 0.0))
            a = max(x - xa, 0.0)
            b = max(xb - x, 0.0)
            y_i = (w * (a**2) * (b**2)) / (3.0 * e_val * i_inertia * span)
            y_xy_total += y_i

        y_xz_total = 0.0
        for load in loads_xz:
            w = float(load.get("w_n", 0.0))
            x = float(load.get("x_mm", 0.0))
            a = max(x - xa, 0.0)
            b = max(xb - x, 0.0)
            y_i = (w * (a**2) * (b**2)) / (3.0 * e_val * i_inertia * span)
            y_xz_total += y_i

        y_total_3d = math.sqrt(y_xy_total**2 + y_xz_total**2)
        if y_total_3d <= 0:
            raise ValueError("ค่าผลรวมความโก่งตัวไม่ถูกต้อง")

        nc_factor = (30.0 / math.pi) * math.sqrt(9810.0)
        nc_rpm = nc_factor / math.sqrt(y_total_3d)

        return {
            "i_inertia_mm4": i_inertia,
            "y_xy_total_mm": y_xy_total,
            "y_xz_total_mm": y_xz_total,
            "y_total_3d_mm": y_total_3d,
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