/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script
// src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        mapTypeControl: false,
        center: { lat: 0, lng: 0 },
        zoom: 13,
    });

    new AutocompleteDirectionsHandler(map);
}



class AutocompleteDirectionsHandler {
    map;
    originPlaceId;
    destinationPlaceId;
    travelMode;
    directionsService;
    directionsRenderer;
    constructor(map) {
        this.map = map;
        this.originPlaceId = "";
        this.destinationPlaceId = "";
        this.travelMode = google.maps.TravelMode.WALKING;
        this.directionsService = new google.maps.DirectionsService();
        this.directionsRenderer = new google.maps.DirectionsRenderer();
        this.directionsRenderer.setMap(map);

        const originInput = document.getElementById("origin-input");
        const destinationInput = document.getElementById("destination-input");
        const modeSelector = document.getElementById("mode-selector");
        // Specify just the place data fields that you need.
        const originAutocomplete = new google.maps.places.Autocomplete(
            originInput,
            { fields: ["place_id"] },
        );
        // Specify just the place data fields that you need.
        const destinationAutocomplete = new google.maps.places.Autocomplete(
            destinationInput,
            { fields: ["place_id"] },
        );

        this.setupClickListener(
            "changemode-walking",
            google.maps.TravelMode.WALKING,
        );
        this.setupClickListener(
            "changemode-transit",
            google.maps.TravelMode.TRANSIT,
        );
        this.setupClickListener(
            "changemode-driving",
            google.maps.TravelMode.DRIVING,
        );
        this.setupPlaceChangedListener(originAutocomplete, "ORIG");
        this.setupPlaceChangedListener(destinationAutocomplete, "DEST");
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
            destinationInput,
        );
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
    }
    // Sets a listener on a radio button to change the filter type on Places
    // Autocomplete.
    setupClickListener(id, mode) {
        const radioButton = document.getElementById(id);

        radioButton.addEventListener("click", () => {
            this.travelMode = mode;
            this.route();
        });
    }
    setupPlaceChangedListener(autocomplete, mode) {
        autocomplete.bindTo("bounds", this.map);
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();

            if (!place.place_id) {
                window.alert("Please select an option from the dropdown list.");
                return;
            }

            if (mode === "ORIG") {
                const destinationNameElement = document.getElementById('originName');
                destinationNameElement.textContent = document.getElementById("origin-input").value;
                this.originPlaceId = place.place_id;
            } else {
                const destinationNameElement = document.getElementById('destinationName');
                destinationNameElement.textContent = document.getElementById("destination-input").value;
                this.destinationPlaceId = place.place_id;
            }
            this.route();

        });
    }
    route() {
        if (!this.originPlaceId || !this.destinationPlaceId) {
            return;
        }

        const me = this;

        this.directionsService.route(
            {
                origin: { placeId: this.originPlaceId },
                destination: { placeId: this.destinationPlaceId },
                travelMode: this.travelMode,
            },
            (response, status) => {
                if (status === "OK") {
                    me.directionsRenderer.setDirections(response);
                    //在這裡寫入向google maps api發送請求後，要更新網頁元素的內容
                    watchObject = response;
                    const distanceElement = document.getElementById('distance');
                    distanceElement.textContent = response.routes[0].legs[0].distance.text;
                    const duration = document.getElementById('duration');
                    duration.textContent = response.routes[0].legs[0].duration.text;

                    let selectedMode = document.querySelector('input[name="type"]:checked').id;
                    const carbon_emissionElement = document.getElementById('carbon_emission');
                    
                    const transportationElement = document.getElementById('transportation');
                    

                    if (selectedMode === "changemode-driving") {
                        transportationElement.textContent = "開車";
                        carbon_emissionElement.textContent = Math.round((response.routes[0].legs[0].distance.value / 1000 * 0.173) * 100) / 100 + ' kg';
                    } else if (selectedMode === "changemode-transit") {
                        transportationElement.textContent = "大眾運輸";
                        carbon_emissionElement.textContent = Math.round((response.routes[0].legs[0].distance.value / 1000 * 0.04) * 100) / 100 + ' kg';
                    } else {
                        transportationElement.textContent = "走路";
                        carbon_emissionElement.textContent = '0 kg';
                    }
                    //console.log(selectedMode);
                    //在這裡寫入向google maps api發送請求後，要更新網頁元素的內容
                } else {
                    window.alert("Directions request failed due to " + status);
                }
            },
        );
    }
}

window.initMap = initMap;
window.onload = function () {
    (function () {
        // 先確認使用者裝置能不能抓地點
        if (navigator.geolocation) {

            // 使用者不提供權限，或是發生其它錯誤
            function error() {
                alert('無法取得你的位置');
            }

            // 使用者允許抓目前位置，回傳經緯度
            function success(position) {
                console.log(position.coords.latitude, position.coords.longitude);
                let origin_lat = position.coords.latitude;
                let origin_lng = position.coords.longitude;

                // 更新地圖的中心點
                if (map) {
                    map.setCenter({ lat: origin_lat, lng: origin_lng });
                }
            }

            // 跟使用者拿所在位置的權限
            navigator.geolocation.getCurrentPosition(success, error);

        } else {
            alert('Sorry, 你的裝置不支援地理位置功能。')
        }
    })();

};
