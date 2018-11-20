# BluetoothRocks! Gyro
Mirror the movements of a physical giant LEGO head on your computer using WebBluetooth


## What do I need?

- [LEGO Storage Head](https://shop.lego.com/en-US/LEGO-Boy-Storage-Head-Large-5005528)
- [Nordic Thingy:52](https://www.nordicsemi.com/eng/Products/Nordic-Thingy-52)
- A browser that support WebBluetooth on your operating system

Try it out at: https://bluetooth.rocks/gyro


## How does this work?

The browser can connect to a Bluetooth LE device like the Nordic Thingy:52. Each Bluetooth device has a number of services and characteristics. Think of them like objects with properties. Once connected to the device, the API then exposes these services and characteristics and you can read from and write to those characteristics. 

The Nordic Thingy:52 contains a large number of sensors that are exposed as characteristics, including a gyroscope. So we can place the Nordic Thingy:52 inside the giant LEGO head and when we move the head, the values of the gyroscope will change. 

By looking at the values of the gyroscope we can determine where the LEGO head is pointing and how it is tilted. We can then change the image of the LEGO head on-screen accordingly.

The LEGO head on the computer screen is rendered using WebGL using the Three.js library. 


## Extra hidden functionality

You can connect a LEGO Tracked Racer with SBrick and use the LEGO head to steer the car. Tilt backwards to go forward, just like the head is actually driving the car and is being pushed backwards into the seat when driving off. 


## Why??

Because it's fun. 
