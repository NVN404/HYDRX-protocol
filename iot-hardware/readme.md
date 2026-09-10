# HydrX Protocol — ESP32 Smart Water Meter Hardware Lab (MagicBlock ER)

## Overview
This directory contains the complete ESP32 microcontroller firmware (`sketch.ino`) and Wokwi simulation diagram (`diagram.json`) for the HydrX DePIN hardware node streaming to **MagicBlock Ephemeral Rollups** on Solana.

### Hardware Components
1. **Microcontroller**: ESP32 Dev Module (NodeMCU ESP-WROOM-32)
2. **Water Flow Sensor**: YF-S201 Hall-Effect Pulse Flow Meter (or linear slide potentiometer in simulation)
3. **Display**: I2C 20x4 Character LCD Display (Address `0x27`)
4. **Communication**: Sub-50ms Zero-Gas Telemetry streaming to HydrX Relayer Proxy on Port `3005` (with port `3000` fallback)

### Wokwi Simulation Quickstart
1. Open the [Wokwi Web Simulator](https://wokwi.com/projects/472508191464530945) or load `sketch.ino` and `diagram.json`.
2. Start the HydrX Relayer (`node server.js` in `magicblockz/relayer/`).
3. Press **▶ Play** in Wokwi and move the slide potentiometer.
4. Watch the 20x4 LCD show real-time flow rate, cumulative volume, and `ER OK` MagicBlock transaction confirmation status!
