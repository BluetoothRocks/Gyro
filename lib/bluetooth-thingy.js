
(function() {
	'use strict';

	class BluetoothThingy {
		constructor() {
			this._EVENTS = {};
            this._CHARACTERISTIC = null;

			this._QUEUE = [];
			this._WORKING = false;
		}
		
		connect() {
            console.log('Requesting Bluetooth Device...');
            
            return new Promise((resolve, reject) => {
            
	            navigator.bluetooth.requestDevice({
			        filters: [
			          { namePrefix: 'Thingy'}
			        ],
			        optionalServices: [
				        'ef680400-9b35-4933-9b10-52ffa9740042'
				    ]
				})
		            .then(device => {
		                console.log('Connecting to GATT Server...');

		                device.addEventListener('gattserverdisconnected', this._disconnect.bind(this));
		                return device.gatt.connect();
		            })
                    .then(server => server.getPrimaryService("ef680400-9b35-4933-9b10-52ffa9740042"))
                    .then(service => service.getCharacteristic("ef680407-9b35-4933-9b10-52ffa9740042"))
                    .then(characteristic => {
                        this._CHARACTERISTIC = characteristic;
                        
                        characteristic.addEventListener('characteristicvaluechanged', function(e) { 
	                        let euler = { 
		                        roll: e.target.value.getInt32(0, true) / 65536,
		                        pitch: e.target.value.getInt32(4, true) / 65536,
		                        yaw: e.target.value.getInt32(8, true) / 65536
	                        };
							
	                        
	                        let direction = 'stop';
	                        
							if (euler.pitch > 30) {
								direction = 'left';
							}
							
							if (euler.pitch < -30) {
								direction = 'right';
							}

							if (euler.roll < -30) {
								direction = 'reverse';
							}
							
							if (euler.roll > 30) {
								direction = 'forward';
							}

	                        let coords = {
	                        	x: this._getRadians(euler.roll + 180),
								y: this._getRadians(euler.yaw + 180),
								z: this._getRadians(euler.pitch + 180)
							}
	                        
	                        if (this._EVENTS['orientationchanged']) {
		                        this._EVENTS['orientationchanged'](coords);
	                        }

	                        if (this._EVENTS['directionchanged']) {
		                        this._EVENTS['directionchanged'](direction);
	                        }
	                    }.bind(this))
                        
                        characteristic.startNotifications();
                        resolve();
		            })
		            .catch(error => {
		                console.log('Could not connect! ' + error);
						reject();
		            });			
			});
			
        }
        
		
		addEventListener(e, f) {
			this._EVENTS[e] = f;
		}

		isConnected() {
			return !! this._CHARACTERISTIC;
		}
			
		_disconnect() {
            console.log('Disconnected from GATT Server...');

			this._CHARACTERISTIC = null;
			
			if (this._EVENTS['disconnected']) {
				this._EVENTS['disconnected']();
			}
		}
		
		_getRadians(degrees) {
			return degrees * Math.PI / 180;
		}
	}

	window.BluetoothThingy = new BluetoothThingy();
})();

