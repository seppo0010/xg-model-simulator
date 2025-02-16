"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import Model from "./model";
import styles from "./page.module.css";
import { FormGroup, FormControlLabel, Switch, FormControl, InputLabel, MenuItem, Select, Slider } from "@mui/material";
import Pateador from './images/pateador.svg';
import Arquero from './images/Arquero.svg';
import Cancha from './images/Cancha.svg';
import Defensor from './images/Defensor.svg';

export default function Home() {
  const [model, setModel] = useState<null | Model>(null);
  const [shotType, setShotType] = useState(0);
  const [shotBodyPart, setShotBodyPart] = useState(0);
  const [passType, setPassType] = useState(0);
  const [underPressure, setUnderPressure] = useState(0);
  const [openGoal, setOpenGoal] = useState(0);
  const [goalKeeperAngle, setGoalKeeperAngle] = useState(1);
  const [distance, setDistance] = useState(12);
  const [angle, setAngle] = useState(90);
  const [prediction, setPrediction] = useState<null | number>(null);

  useState(() => {
    if (!model) {
      const m = new Model();
      (async () => { console.log({ prediction: await m.predict([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]) }) })()
      setModel(m)
    }
  })
  const getParams = () => ({
    shot_type_name: shotType,
    shot_body_part_name: shotBodyPart,
    pass_type: passType,
    under_pressure: underPressure,
    open_goal: openGoal,
    players_in_between: 10,
    goal_keeper_angle: goalKeeperAngle,
    distance,
    angle,
  } as { [key: string]: number });
  useEffect(() => {
    const ps = getParams();
    setPrediction(null);
    (async () => {
      if (!model) return;
      const pred = await model.predict(ps)
      if (Object.entries(getParams()).every(([k, v]) => v === ps[k])) {
        setPrediction(Math.max(Math.min(pred, 1), 0));
      }
    })()
  }, [model, shotType, shotBodyPart, passType, underPressure, openGoal, goalKeeperAngle, distance, angle])
  const [pateadorLeft, setPateadorLeft] = useState(0);
  const [pateadorTop, setPateadorTop] = useState(0)
  const [arqueroLeft, setArqueroLeft] = useState(0);
  const [arqueroTop, setArqueroTop] = useState(0)
  const [defensorLeft, setDefensorLeft] = useState(0);
  const [defensorTop, setDefensorTop] = useState(0)
  useEffect(() => {
    // soh cah toa
    const BASE_LEFT = 203
    const BASE_TOP = 10;
    // 12m (penalty)=92px
    const METER_TO_PX = 23/3;
    const alpha = (angle - 90) / 180 * Math.PI;
    setPateadorTop(Math.cos(alpha) * METER_TO_PX * distance + BASE_TOP);
    setPateadorLeft(Math.sin(alpha) * METER_TO_PX * distance + BASE_LEFT);
    setDefensorTop(Math.cos(alpha) * METER_TO_PX * distance + BASE_TOP - 8);
    setDefensorLeft(Math.sin(alpha) * METER_TO_PX * distance + BASE_LEFT + 48);
    setArqueroTop(BASE_TOP)
    setArqueroLeft(BASE_LEFT + 22 - 19 * (goalKeeperAngle / 22))
  }, [distance, angle, goalKeeperAngle])
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <FormGroup>
          <FormControlLabel control={<Switch id="shot_type_name" onChange={(e) => setShotType(e.target.checked ? 1 : 0)} checked={shotType === 1} />} label="Pelota parada" />
          <FormControl fullWidth>
            <InputLabel id="shot_body_part_name">Parte del cuerpo</InputLabel>
            <Select
              labelId="shot_body_part_name-label"
              id="shot_body_part_name"
              label="Parte del cuerpo"
              onChange={(e) => setShotBodyPart(e.target.value as number)}
              value={shotBodyPart}
            >
              <MenuItem value={0}>Píe</MenuItem>
              <MenuItem value={1}>Cabeza</MenuItem>
              <MenuItem value={2}>Otro</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="pass_type">Pase anterior</InputLabel>
            <Select
              labelId="pass_type-label"
              id="pass_type"
              label="Pase anterior"
              onChange={(e) => setPassType(e.target.value as number)}
              value={passType}
            >
              <MenuItem value={4}>Sin asistencia</MenuItem>
              <MenuItem value={0}>Centro</MenuItem>
              <MenuItem value={1}>Pase atrás</MenuItem>
              <MenuItem value={2}>De corner</MenuItem>
              <MenuItem value={3}>De tiro libre</MenuItem>
              <MenuItem value={6}>Pase filtrado</MenuItem>
              <MenuItem value={5}>Otro</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel control={<Switch id="open_goal" onChange={(e) => setOpenGoal(e.target.checked ? 1 : 0)} checked={openGoal === 1} />} label="Arco vacío (open goal)" />
          <FormControlLabel control={<Switch id="under_pressure" onChange={(e) => setUnderPressure(e.target.checked ? 1 : 0)} checked={underPressure === 1} />} label="Bajo presión" />
          Ángulo cubierto por el arquero
          <Slider
            id="goal_keeper_angle"
            aria-label="Ángulo cubierto por el arquero"
            defaultValue={1}
            step={1}
            min={0}
            max={22}
            valueLabelDisplay="auto"
            value={goalKeeperAngle}
            onChange={(e, val) => setGoalKeeperAngle(val as number)}
          />
          Distancia
          <Slider
            id="distance"
            aria-label="Distancia"
            defaultValue={12}
            step={0.1}
            min={0}
            max={35}
            valueLabelDisplay="auto"
            value={distance}
            onChange={(e, val) => setDistance(val as number)}
          />
          Ángulo del tiro
          <Slider
            id="angle"
            aria-label="Ángulo del tiro"
            defaultValue={5}
            step={0.5}
            min={0}
            max={90}
            valueLabelDisplay="auto"
            value={angle}
            onChange={(e, val) => setAngle(val as number)}
          />
        </FormGroup>
        Probabilidad: 
        {prediction === null ? 'Calculando...' : (prediction * 100).toLocaleString(undefined, {maximumFractionDigits:2})}
      </main>
      {pateadorLeft !== 0 && pateadorTop !== 0 && <footer className={styles.footer}>
        <Image src={Cancha} alt={""} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}/>
        <Image src={Arquero} alt={""} style={{ position: 'absolute', top: arqueroTop, left: arqueroLeft, width: 50, height: 45, visibility: openGoal ? 'hidden' : 'visible'}} />
        <Image src={Pateador} alt={""} style={{ position: 'absolute', top: pateadorTop, left: pateadorLeft, width: 50, height: 50}} />
        <Image src={Defensor} alt={""} style={{ position: 'absolute', top: defensorTop, left: defensorLeft, width: 50, height: 45, visibility: underPressure ? 'visible' : 'hidden'}} />
      </footer>}
    </div>
  );
}
