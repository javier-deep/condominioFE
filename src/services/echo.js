import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

window.Echo = new Echo({
  broadcaster: "reverb",
  key: "nvjwvldglvguqgwru6eb", 
  wsHost: "localhost",
  wsPort: 8081, 
  wssPort: 8081,
  forceTLS: false,
  enabledTransports: ['ws', 'wss'],
  disableStats: true,
});