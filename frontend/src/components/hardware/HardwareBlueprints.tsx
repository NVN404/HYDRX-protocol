'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';

export default function HardwareBlueprints() {
  const [activePage, setActivePage] = useState<'enclosure' | 'exploded' | 'retrofit'>('enclosure');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Sub-Tabs for the 3 Hardware Pages */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '14px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActivePage('enclosure')}
            className="btn-mono-ghost"
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              background: activePage === 'enclosure' ? 'var(--text-1)' : 'transparent',
              color: activePage === 'enclosure' ? 'var(--canvas)' : 'var(--text-1)',
              fontWeight: activePage === 'enclosure' ? 700 : 500,
            }}
          >
            [01] IP68 Physical Field Enclosure
          </button>

          <button
            onClick={() => setActivePage('exploded')}
            className="btn-mono-ghost"
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              background: activePage === 'exploded' ? 'var(--text-1)' : 'transparent',
              color: activePage === 'exploded' ? 'var(--canvas)' : 'var(--text-1)',
              fontWeight: activePage === 'exploded' ? 700 : 500,
            }}
          >
            [02] Exploded PCB & $10 DIY BOM
          </button>

          <button
            onClick={() => setActivePage('retrofit')}
            className="btn-mono-ghost"
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              background: activePage === 'retrofit' ? 'var(--text-1)' : 'transparent',
              color: activePage === 'retrofit' ? 'var(--canvas)' : 'var(--text-1)',
              fontWeight: activePage === 'retrofit' ? 700 : 500,
            }}
          >
            [03] Household Plumbing Retrofit
          </button>
        </div>

        <span className="pill font-mono" style={{ fontSize: '0.72rem' }}>
          OPEN HARDWARE SPECIFICATION v1.4
        </span>
      </div>

      {/* PAGE 1: IP68 PHYSICAL ENCLOSURE BLUEPRINT */}
      {activePage === 'enclosure' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div className="surface" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <span className="pill font-mono" style={{ marginBottom: '6px' }}>CAD ENGINEERING BLUEPRINT</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-1)', margin: '4px 0' }}>
                  HydrX Field Unit — IP68 Waterproof Smart Sub-Meter
                </h2>
                <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', margin: 0 }}>
                  High-durability residential and commercial water sub-metering unit with integrated matrix display and tamper detection.
                </p>
              </div>
              <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                DIMENSIONS: 132mm × 94mm × 52mm
              </span>
            </div>

            {/* Assembled Prototype Photo Showcase — Clear View with No Boundary Shadow */}
            <div style={{
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid var(--border-strong)',
              marginBottom: '20px',
              background: '#0a0a0a',
            }}>
              <img
                src="/images/jal_assembled_prototype.jpg"
                alt="HydrX Protocol Assembled Physical Field Node Prototype"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              <div style={{
                padding: '14px 18px',
                borderTop: '1px solid var(--border)',
                background: 'var(--surface-elevated)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                <div>
                  <span className="pill font-mono" style={{ fontSize: '0.72rem', color: '#22c55e', borderColor: 'rgba(34,197,94,0.4)' }}>
                    ASSEMBLED PHYSICAL PROTOTYPE
                  </span>
                  <div style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: '0.95rem', marginTop: '4px' }}>
                    HydrX Field Unit Prototype · Ref: #HYDRX-ESP32-101
                  </div>
                </div>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                  LIVE IN-LINE FLOW RIG & GREEN LCD
                </span>
              </div>
            </div>

            {/* SVG Engineering Schematic Visual */}
            <div style={{
              background: 'linear-gradient(180deg, #091210 0%, #060c0b 100%)',
              borderRadius: '8px',
              border: '1px solid rgba(143, 200, 192, 0.25)',
              padding: '24px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflowX: 'auto',
            }}>
              <svg width="680" height="340" viewBox="0 0 680 340" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '100%', height: 'auto' }}>
                {/* Grid Lines */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(143, 200, 192, 0.08)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="680" height="340" fill="url(#grid)" />

                {/* Outer Casing / Enclosure */}
                <rect x="180" y="40" width="320" height="250" rx="16" fill="#122522" stroke="#59c2b6" strokeWidth="2.5" strokeDasharray="none" />
                <rect x="190" y="50" width="300" height="230" rx="10" fill="#0d1c1a" stroke="rgba(143,200,192,0.3)" strokeWidth="1.5" />

                {/* 4 Corner Hex Security Screws */}
                <circle cx="204" cy="64" r="7" fill="#1c3834" stroke="#c9a15a" strokeWidth="1.5" />
                <line x1="200" y1="64" x2="208" y2="64" stroke="#c9a15a" strokeWidth="1.5" />
                <line x1="204" y1="60" x2="204" y2="68" stroke="#c9a15a" strokeWidth="1.5" />

                <circle cx="476" cy="64" r="7" fill="#1c3834" stroke="#c9a15a" strokeWidth="1.5" />
                <line x1="472" y1="64" x2="480" y2="64" stroke="#c9a15a" strokeWidth="1.5" />
                <line x1="476" y1="60" x2="476" y2="68" stroke="#c9a15a" strokeWidth="1.5" />

                <circle cx="204" cy="266" r="7" fill="#1c3834" stroke="#c9a15a" strokeWidth="1.5" />
                <line x1="200" y1="266" x2="208" y2="266" stroke="#c9a15a" strokeWidth="1.5" />
                <line x1="204" y1="262" x2="204" y2="270" stroke="#c9a15a" strokeWidth="1.5" />

                <circle cx="476" cy="266" r="7" fill="#1c3834" stroke="#c9a15a" strokeWidth="1.5" />
                <line x1="472" y1="266" x2="480" y2="266" stroke="#c9a15a" strokeWidth="1.5" />
                <line x1="476" y1="262" x2="476" y2="270" stroke="#c9a15a" strokeWidth="1.5" />

                {/* Solid Brass Pipe Couplings */}
                {/* Left Inlet */}
                <rect x="70" y="140" width="110" height="50" rx="4" fill="#a47e3b" stroke="#e6c888" strokeWidth="2" />
                <rect x="80" y="145" width="20" height="40" fill="#785923" />
                <rect x="110" y="145" width="20" height="40" fill="#785923" />
                <text x="75" y="130" fill="#e6c888" fontSize="11" fontFamily="monospace" fontWeight="bold">3/4" BSP INLET</text>
                <line x1="125" y1="165" x2="165" y2="165" stroke="#59c2b6" strokeWidth="3" strokeDasharray="4 2" />

                {/* Right Outlet */}
                <rect x="500" y="140" width="110" height="50" rx="4" fill="#a47e3b" stroke="#e6c888" strokeWidth="2" />
                <rect x="550" y="145" width="20" height="40" fill="#785923" />
                <rect x="580" y="145" width="20" height="40" fill="#785923" />
                <text x="505" y="130" fill="#e6c888" fontSize="11" fontFamily="monospace" fontWeight="bold">3/4" BSP OUTLET</text>
                <line x1="515" y1="165" x2="555" y2="165" stroke="#59c2b6" strokeWidth="3" strokeDasharray="4 2" />

                {/* Green Matrix LCD Display Screen */}
                <rect x="220" y="75" width="240" height="95" rx="6" fill="#143522" stroke="#08170f" strokeWidth="2" />
                <rect x="225" y="80" width="230" height="85" fill="#183a26" />
                <text x="235" y="98" fill="#86efac" fontSize="11" fontFamily="monospace" fontWeight="bold">METER: HYDRX-NODE-101</text>
                <text x="235" y="116" fill="#86efac" fontSize="11" fontFamily="monospace">FLOW : 0.25 L/s (15.0 L/m)</text>
                <text x="235" y="134" fill="#86efac" fontSize="11" fontFamily="monospace">TOTAL: 4.87 L</text>
                <text x="235" y="152" fill="#6ee7b7" fontSize="11" fontFamily="monospace" fontWeight="bold">STATUS: ATTESTED OK</text>

                {/* Hardware Status LEDs */}
                <circle cx="235" cy="195" r="5" fill="#22c55e" />
                <text x="246" y="199" fill="#8fa6a2" fontSize="9" fontFamily="monospace">PWR</text>

                <circle cx="285" cy="195" r="5" fill="#f59e0b" />
                <text x="296" y="199" fill="#8fa6a2" fontSize="9" fontFamily="monospace">TX/PULSE</text>

                <circle cx="355" cy="195" r="5" fill="#ef4444" />
                <text x="366" y="199" fill="#8fa6a2" fontSize="9" fontFamily="monospace">TAMPER</text>

                {/* Optical Tamper Seal & Brand Plate */}
                <rect x="220" y="215" width="240" height="45" rx="4" fill="#132421" stroke="rgba(201,161,90,0.4)" strokeWidth="1" />
                <text x="232" y="234" fill="#c9a15a" fontSize="11" fontFamily="monospace" fontWeight="bold">HYDRX PROTOCOL · SOLANA DePIN</text>
                <text x="232" y="248" fill="#8fa6a2" fontSize="9" fontFamily="monospace">SECURITY SEAL: #HYDRX-SEC-94021 [ACTIVE]</text>
              </svg>
            </div>

            {/* Specifications Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px' }}>
              <div style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>INGRESS PROTECTION</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-1)', marginTop: '4px' }}>IP68 Waterproof</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '2px' }}>Submersible to 1.5m for 2 hours, silicone gasket seal.</div>
              </div>

              <div style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>PIPE COUPLING</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-1)', marginTop: '4px' }}>3/4" Solid Brass</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '2px' }}>Rated for potable water up to 1.75 MPa (17.5 bar).</div>
              </div>

              <div style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>POWER CONSUMPTION</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-1)', marginTop: '4px' }}>0.45W Avg / 5V DC</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '2px' }}>Li-ion 18650 battery backup (14 days standby on outage).</div>
              </div>

              <div style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>DATA SECURITY</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-1)', marginTop: '4px' }}>SHA-256 Edge Signing</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '2px' }}>Hardware crypto-accelerated pulse telemetry packets.</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* PAGE 2: EXPLODED PCB & $10 DIY BOM */}
      {activePage === 'exploded' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div className="surface" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <span className="pill font-mono" style={{ marginBottom: '6px' }}>EXPLODED ARCHITECTURE & BOM</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-1)', margin: '4px 0' }}>
                  $10 Open-Source Hardware Bill of Materials (BOM)
                </h2>
                <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', margin: 0 }}>
                  Every component is non-proprietary and available on Mouser, DigiKey, or local electronics markets globally.
                </p>
              </div>
              <span className="pill font-mono" style={{ fontSize: '0.76rem', color: '#22c55e', borderColor: '#22c55e60' }}>
                TOTAL UNIT BOM: ~$9.80 USD
              </span>
            </div>

            {/* Components Kit Flat-Lay Photo Showcase — Clear View with No Boundary Shadow */}
            <div style={{
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid var(--border-strong)',
              marginBottom: '24px',
              background: '#0a0a0a',
            }}>
              <img
                src="/images/jal_hardware_components.jpg"
                alt="HydrX Protocol Open-Source Hardware Components Kit"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              <div style={{
                padding: '14px 18px',
                borderTop: '1px solid var(--border)',
                background: 'var(--surface-elevated)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                <div>
                  <span className="pill font-mono" style={{ fontSize: '0.72rem', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.4)' }}>
                    OPEN-SOURCE HARDWARE KIT
                  </span>
                  <div style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: '0.95rem', marginTop: '4px' }}>
                    Itemized Modular Electronics (~$9.80 Total BOM)
                  </div>
                </div>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                  ESP32 · YF-S201 · 20x4 LCD · TP4056 · TAMPER LOOP
                </span>
              </div>
            </div>

            {/* Bill of Materials Table */}
            <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
              <table className="table-clean" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Item #</th>
                    <th>Component Name</th>
                    <th>Specification / Function</th>
                    <th>Sourcing Reference</th>
                    <th style={{ textAlign: 'right' }}>Est. Cost (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono" style={{ color: 'var(--text-3)' }}>01</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>ESP32-WROOM-32D</td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-2)' }}>Dual-core 240MHz SoC, 802.11 b/g/n WiFi + BLE, hardware SHA-256 accelerator</td>
                    <td className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Espressif Systems</td>
                    <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-1)' }}>$2.80</td>
                  </tr>
                  <tr>
                    <td className="font-mono" style={{ color: 'var(--text-3)' }}>02</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>YF-S201 Flow Sensor</td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-2)' }}>Hall-Effect magnetic turbine, 1–30 L/min, 450 pulses/liter calibration factor</td>
                    <td className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Sea Flow Sensor</td>
                    <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-1)' }}>$3.20</td>
                  </tr>
                  <tr>
                    <td className="font-mono" style={{ color: 'var(--text-3)' }}>03</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>20x4 I2C Character LCD</td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-2)' }}>HD44780 controller, PCF8574 I2C backpack, green matrix backlight (address 0x27)</td>
                    <td className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Generic Industrial</td>
                    <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-1)' }}>$1.85</td>
                  </tr>
                  <tr>
                    <td className="font-mono" style={{ color: 'var(--text-3)' }}>04</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>TP4056 Power Management</td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-2)' }}>1A Li-Ion battery charger with overcurrent & over-discharge protection</td>
                    <td className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>NanJing Top Power</td>
                    <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-1)' }}>$0.45</td>
                  </tr>
                  <tr>
                    <td className="font-mono" style={{ color: 'var(--text-3)' }}>05</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>Tamper Detection Switch</td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-2)' }}>Normally-closed mechanical microswitch in enclosure lid, pull-up interrupt GPIO18</td>
                    <td className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Omron / Generic</td>
                    <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-1)' }}>$0.30</td>
                  </tr>
                  <tr>
                    <td className="font-mono" style={{ color: 'var(--text-3)' }}>06</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>ABS Weatherproof Junction Box</td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-2)' }}>IP68 gasketed enclosure with PG7 waterproof cable glands & brass adapters</td>
                    <td className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Generic Industrial</td>
                    <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-1)' }}>$1.20</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Circuit Architecture Breakdown */}
            <div style={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '16px 20px',
              fontSize: '0.84rem',
              color: 'var(--text-2)',
              lineHeight: 1.6,
            }}>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-1)', display: 'block', marginBottom: '6px' }}>
                ELECTRICAL ISOLATION & FAIL-SAFE DESIGN:
              </span>
              The Hall sensor signal line (Pin 34 / interrupt pin) is optically isolated to eliminate galvanic ground loops from municipal iron piping.
              If the tamper switch is tripped (enclosure opened), the firmware immediately sends a signed `tamper: true` attestation to the Solana relayer and halts credit minting until cryptographically reset by the authority keypair.
            </div>
          </div>
        </motion.div>
      )}

      {/* PAGE 3: HOUSEHOLD PLUMBING RETROFIT GUIDE */}
      {activePage === 'retrofit' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div className="surface" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <span className="pill font-mono" style={{ marginBottom: '6px' }}>FIELD INSTALLATION GUIDE</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-1)', margin: '4px 0' }}>
                  15-Minute Zero-Cut Household Pipe Retrofit
                </h2>
                <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', margin: 0 }}>
                  Standard plumbing integration blueprint for single-family homes and multi-tenant apartment manifolds.
                </p>
              </div>
              <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                TOOLSET: Crescent wrench + Teflon tape
              </span>
            </div>

            {/* Real-World Plumbing Retrofit Photo Showcase — Clear View with No Boundary Shadow */}
            <div style={{
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid var(--border-strong)',
              marginBottom: '20px',
              background: '#0a0a0a',
            }}>
              <img
                src="/images/jal_household_retrofit.jpg"
                alt="HydrX Protocol Smart Water Meter Installed in Household Plumbing"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              <div style={{
                padding: '14px 18px',
                borderTop: '1px solid var(--border)',
                background: 'var(--surface-elevated)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                <div>
                  <span className="pill font-mono" style={{ fontSize: '0.72rem', color: '#22c55e', borderColor: 'rgba(34,197,94,0.4)' }}>
                    REAL-WORLD RESIDENTIAL RETROFIT
                  </span>
                  <div style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: '0.95rem', marginTop: '4px' }}>
                    Standard In-Line Installation with Flexible Braided Hoses & Ball Valve
                  </div>
                </div>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                  ZERO PIPE CUTTING · 15-MINUTE SETUP
                </span>
              </div>
            </div>

            {/* Plumbing Diagram Visual */}
            <div style={{
              background: 'linear-gradient(180deg, #091210 0%, #060c0b 100%)',
              borderRadius: '8px',
              border: '1px solid rgba(143, 200, 192, 0.25)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span className="font-mono" style={{ fontSize: '0.8rem', color: '#59c2b6', fontWeight: 700 }}>
                  WATER FLOW DIRECTION: INLET → SEDIMENT FILTER → HYDRX NODE → CHECK VALVE → DOMESTIC OUTLET
                </span>
                <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>
                  PULSE FORMULA: Q (L/min) = Frequency (Hz) / 7.5
                </span>
              </div>

              {/* Schematic Flow Steps */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '10px' }}>
                <div style={{ padding: '12px', border: '1px solid rgba(143,200,192,0.2)', borderRadius: '6px', background: 'rgba(18,37,34,0.4)' }}>
                  <span className="font-mono" style={{ fontSize: '0.74rem', color: '#c9a15a', fontWeight: 700 }}>STEP 1: ISOLATION</span>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-1)', fontWeight: 600, marginTop: '4px' }}>Shut Main Ball Valve</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '2px' }}>Depressurize the residential line by briefly opening any domestic faucet.</div>
                </div>

                <div style={{ padding: '12px', border: '1px solid rgba(143,200,192,0.2)', borderRadius: '6px', background: 'rgba(18,37,34,0.4)' }}>
                  <span className="font-mono" style={{ fontSize: '0.74rem', color: '#c9a15a', fontWeight: 700 }}>STEP 2: SEDIMENT FILTER</span>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-1)', fontWeight: 600, marginTop: '4px' }}>Thread 100-Mesh Strainer</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '2px' }}>Prevents sand and mineral particulates from fouling the Hall-effect turbine blades.</div>
                </div>

                <div style={{ padding: '12px', border: '1px solid rgba(143,200,192,0.2)', borderRadius: '6px', background: 'rgba(18,37,34,0.4)' }}>
                  <span className="font-mono" style={{ fontSize: '0.74rem', color: '#c9a15a', fontWeight: 700 }}>STEP 3: METER COUPLING</span>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-1)', fontWeight: 600, marginTop: '4px' }}>Mount HydrX Field Unit</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '2px' }}>Hand-tighten 3/4" brass unions with PTFE tape. Ensure arrow aligns with water flow.</div>
                </div>

                <div style={{ padding: '12px', border: '1px solid rgba(143,200,192,0.2)', borderRadius: '6px', background: 'rgba(18,37,34,0.4)' }}>
                  <span className="font-mono" style={{ fontSize: '0.74rem', color: '#c9a15a', fontWeight: 700 }}>STEP 4: PROVISIONING</span>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-1)', fontWeight: 600, marginTop: '4px' }}>WiFi & Wallet Pairing</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '2px' }}>Device boots in AP mode, connects to home WiFi, and links to your Solana address.</div>
                </div>
              </div>
            </div>

            {/* Calibration Curve Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
              <div style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>PULSE COEFFICIENT</span>
                <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-1)', marginTop: '4px' }}>
                  450 Pulses / Liter (±1.5%)
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '4px' }}>
                  Calibrated across laminar flow ranges (1.0 to 30.0 L/min) using positive displacement reference test rig.
                </div>
              </div>

              <div style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>QUADRATIC CORRECTION FORMULA</span>
                <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-1)', marginTop: '6px' }}>
                  L_actual = 0.982 · L_raw + 0.0004 · (L_raw)²
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '4px' }}>
                  Embedded firmware dynamically compensates for micro-drips and ultra-low pressure friction loss.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
