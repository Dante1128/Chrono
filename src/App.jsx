import React, { useState, useEffect } from 'react';
import './app.css';

export default function TimeTracker() {
  const [activeTab, setActiveTab] = useState('registro');
  const [entries, setEntries] = useState([]);
  const [goalHours, setGoalHours] = useState(40);
  const [showSettings, setShowSettings] = useState(false);
  const [tempGoal, setTempGoal] = useState(40);

  // Form state
  const [entryDate, setEntryDate] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [exitDate, setExitDate] = useState('');
  const [exitTime, setExitTime] = useState('');

  useEffect(() => {
    const savedEntries = localStorage.getItem('timeEntries');
    const savedGoal = localStorage.getItem('goalHours');
    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedGoal) {
      setGoalHours(Number(savedGoal));
      setTempGoal(Number(savedGoal));
    }
    const today = new Date().toISOString().split('T')[0];
    setEntryDate(today);
    setExitDate(today);
  }, []);

  useEffect(() => {
    localStorage.setItem('timeEntries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('goalHours', goalHours.toString());
  }, [goalHours]);

  const addEntry = (e) => {
    e.preventDefault();
    if (!entryDate || !entryTime || !exitDate || !exitTime) {
      alert('Por favor completa todos los campos');
      return;
    }
    const startDateTime = new Date(`${entryDate}T${entryTime}`);
    const endDateTime = new Date(`${exitDate}T${exitTime}`);
    if (endDateTime <= startDateTime) {
      alert('La hora de salida debe ser posterior a la hora de entrada');
      return;
    }
    const hours = (endDateTime - startDateTime) / (1000 * 60 * 60);
    const newEntry = {
      id: Date.now(),
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      hours: hours,
      entryDate, entryTime, exitDate, exitTime
    };
    setEntries([newEntry, ...entries]);
    setEntryTime('');
    setExitTime('');
  };

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const remainingHours = Math.max(0, goalHours - totalHours);
  const percentage = Math.min(100, (totalHours / goalHours) * 100);
  const isGoalReached = totalHours >= goalHours;

  const deleteEntry = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  const saveGoal = () => {
    if (tempGoal > 0) {
      setGoalHours(tempGoal);
      setShowSettings(false);
    } else {
      alert('El objetivo debe ser mayor a 0');
    }
  };

  return (
    <div className="time-tracker">
      <div className="container">
        <div className="card header">
          <div>
            <h1>TimeTrack</h1>
            <p>Control inteligente de horas</p>
          </div>
          <button className="button" onClick={() => setShowSettings(!showSettings)}>
            ⚙ Configuración
          </button>
        </div>

        {showSettings && (
          <div className="card">
            <label>Objetivo de horas:</label>
            <input type="number" value={tempGoal} onChange={(e) => setTempGoal(Number(e.target.value))} />
            <button className="button" onClick={saveGoal}>Guardar</button>
            <button className="button" onClick={() => { setTempGoal(goalHours); setShowSettings(false); }}>Cancelar</button>
          </div>
        )}

        <div className="tabs">
          <div className={`tab ${activeTab==='registro'?'active':''}`} onClick={()=>setActiveTab('registro')}>Registrar</div>
          <div className={`tab ${activeTab==='historial'?'active':''}`} onClick={()=>setActiveTab('historial')}>Historial</div>
        </div>

        {activeTab==='registro' ? (
          <div className="card">
            <h2>Nuevo Registro</h2>
            <form onSubmit={addEntry}>
              <label>Entrada:</label>
              <input type="date" value={entryDate} onChange={(e)=>setEntryDate(e.target.value)} />
              <input type="time" value={entryTime} onChange={(e)=>setEntryTime(e.target.value)} />
              <label>Salida:</label>
              <input type="date" value={exitDate} onChange={(e)=>setExitDate(e.target.value)} />
              <input type="time" value={exitTime} onChange={(e)=>setExitTime(e.target.value)} />
              <button className="button" type="submit">Agregar Registro</button>
            </form>
          </div>
        ) : (
          <div className="card table-container">
            <table>
              <thead>
                <tr>
                  <th>Fecha Entrada</th>
                  <th>Hora Entrada</th>
                  <th>Fecha Salida</th>
                  <th>Hora Salida</th>
                  <th>Total</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry=>(
                  <tr key={entry.id}>
                    <td>{entry.entryDate}</td>
                    <td>{entry.entryTime}</td>
                    <td>{entry.exitDate}</td>
                    <td>{entry.exitTime}</td>
                    <td>{entry.hours.toFixed(2)}h</td>
                    <td>
                      <button className="button" onClick={()=>deleteEntry(entry.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="card">
          <h2>Progreso General</h2>
          <div className="progress-bar">
            <div className="progress-bar-inner" style={{width:`${percentage}%`}}>
              {percentage.toFixed(0)}%
            </div>
          </div>
          <p>{remainingHours.toFixed(1)} horas restantes</p>
        </div>

      </div>
    </div>
  );
}
