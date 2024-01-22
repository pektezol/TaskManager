import React, { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { notification } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
const Weather = () => {
    const [api, contextHolder] = notification.useNotification();


    const openNotification = (data: any) => {
        api.open({
            message: 'Weather',
            description:
                `Weather in ${data.location.name}, ${data.location.region}: ${data.current.condition.text} with a temperature of ${data.current.temp_c}°C`,
            icon: <SmileOutlined style={{ color: '#108ee9' }} />,
        });
    };

    useEffect(() => {
        let map: L.Map | L.LayerGroup<any>;

        const initMap = () => {
            map = L.map('map').setView([41.108, 29.008], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            map.on('click', function (e) {
                const lat = e.latlng.lat.toFixed(6);
                const lng = e.latlng.lng.toFixed(6);

                fetch(`https://api.weatherapi.com/v1/current.json?key=5c028746d8b14fb8925103513242001&q=${lat},${lng}&aqi=no`)
                    .then(response => response.json())
                    .then(data => {
                        { openNotification(data) }
                    })
                    .catch(() => {
                        alert('Error retrieving weather data');
                    });
            });
        };

        initMap();

        return () => {
            if (map) {
                map.remove(); // Ensure the map is properly destroyed when the component is unmounted
            }
        };
    }, []);

    return (<>
        {contextHolder}
        <div id="map" style={{ height: '100%' }} />

    </>
    );
};

export default Weather;

