import './app.css'
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import CLOUDS from 'vanta/dist/vanta.clouds.min'
import Aos from 'aos';


function App() {
    const [vh, setVh] = useState(window.innerHeight);
    const inputRef = useRef(null);
    const [data, setData] = useState(null)
    const [isFetching, setIsFetching] = useState(true)
    const [defaultLocation, setDefaultLocation] = useState('')

    function apiRequest(location) {
        axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${import.meta.env.VITE_WEATHER_KEY}&q=${location}&days=5&aqi=no&lang=fr`)
            .then(response => {
                setData(response.data)
                setIsFetching(false)
            }).catch(() => {
                // Gérer les erreurs
            })
    }

    function getLocation() {
        axios.get(`https://api.geoapify.com/v1/ipinfo?&apiKey=${import.meta.env.VITE_IP_KEY}`).then(data => {
            setDefaultLocation(data.data.city.name + ' ' + data.data.state.name + ' ' +  data.data.country.name_native)
        }).catch(() => {
            // Gérer les erreurs
        })
    }

    useEffect(() => {
        getLocation()
        const updateVh = () => {
            setVh(window.innerHeight)
        };
        window.addEventListener('resize', updateVh)
        return () => window.removeEventListener('resize', updateVh)
    }, []);

    useEffect(() => {
        apiRequest(defaultLocation.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase())
    }, [defaultLocation]);

    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            apiRequest(inputRef.current.value.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase())
        }
    }

    const [vantaEffect, setVantaEffect] = useState(0)
    const myRef = useRef(null)
    useEffect(() => {
     if (!vantaEffect) {
        setVantaEffect(CLOUDS({
          el: myRef.current
      }))        
      }
      return () => {
        if (vantaEffect) vantaEffect.destroy()
      }
    }, [vantaEffect])
  Aos.init({duration:3000})
    return (
        <div className="App" style={{ height: vh }} id='my-background' ref={myRef}>
            <div className="container" >
                <header className={"header-input"}>
                    <div>
                        <input className={"location-input"} placeholder={"Renseignez une ville"} onKeyPress={(e) => { handleKeyPress(e) }} ref={inputRef} />
                        <p className={"observations"}>Cliquez sur entrer pour voir la météo</p>
                    </div>
                    {isFetching ? <></> : (
                        <div>
                            <h1 className={"location"}>{data.location.name},</h1>
                            <p className={"region"}>{data.location.region}, {data.location.country}.</p>
                        </div>
                    )}
                </header>
                {isFetching ? <p className={"loading"}>Chargement...</p> : (
                    <main className={"main-data"}>
                        <div className={"temperature"}>
                            <p className={"temp"}>{data.current.temp_c}° C</p>
                            <p className={"last-update"}>
                                Actualisation: {data.current.last_updated}
                            </p>
                        </div>
                        <div className={"weather"}>
                            <img className={"img"} src={`https://cdn.weatherapi.com/weather/128x128/${data.current.condition.icon.split('/')[5]}/${data.current.condition.icon.split('/')[6]}`} alt={"Weather pic"}
                                width={150}
                                height={150} />
                            <p className={"weather-label"}>{data.current.condition.text}</p>
                        </div>
                    </main>
                )}
                {isFetching ? <></> : (
                    <div className={"forecast"}>
                        <h2>Prévisions des jours à venir :</h2>
                        <div className={"forecast-days"}>
                            {data.forecast.forecastday.map((day, index) => (
                                <div key={index} className={"forecast-day"}>
                                    <p>{day.date}</p>
                                    <img
                                        src={`${day.day.condition.icon}`}
                                        alt={`Weather pic for ${day.date}`}
                                    />
                                    <p>Max: {day.day.maxtemp_c}° C</p>
                                    <p>Min: {day.day.mintemp_c}° C</p>
                                    <p>{day.day.condition.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default App;
