// import Pusher from "pusher-js";
// import Echo from "laravel-echo";

// let echoInstance = null;

// export function initSocket() {
//   if (echoInstance) return echoInstance;

//   try {
//     window.Pusher = Pusher;

//     echoInstance = new Echo({
//       broadcaster: "pusher",
//       key: "local",
//       cluster: "mt1",

//       wsHost: "localhost",
//       wsPort: 6001,

//       forceTLS: false,
//       encrypted: false,
//       enabledTransports: ["ws"],

//       authEndpoint: "http://localhost/api/broadcasting/auth",
//     });

//     window.Echo = echoInstance;

//     console.log("✅ Echo initialized");
//     return echoInstance;
//   } catch (error) {
//     console.error("❌ Failed to initialize Echo:", error);
//     return null;
//   }
// }

// export default initSocket;

import Pusher from "pusher-js";
import Echo from "laravel-echo";

let echoInstance = null;

export function initSocket() {
  if (echoInstance) return echoInstance;

  try {
    window.Pusher = Pusher;

    echoInstance = new Echo({
      broadcaster: "pusher",
      key: "local",
      cluster: "mt1",

      // Use domain (no protocol, no trailing slash)
      wsHost: "clientadmin.cabifyit.com",
      wsPort: 6002,
      wssPort: 6002,

      // Enable TLS and secure websocket transport
      forceTLS: true,
      encrypted: true,
      enabledTransports: ["ws", "wss"],

      // Point auth endpoint to the production domain
      authEndpoint: "https://clientadmin.cabifyit.com/api/broadcasting/auth",
    });

    window.Echo = echoInstance;

    console.log("✅ Echo initialized");
    return echoInstance;
  } catch (error) {
    console.error("❌ Failed to initialize Echo:", error);
    return null;
  }
}

export default initSocket;
