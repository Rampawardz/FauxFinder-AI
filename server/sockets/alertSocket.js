
export default function initAlertSocket(io) {
  io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);

    socket.join("global_alerts");

    socket.emit("connection:success", { message: "Connected to alert system" });

    socket.on("client:test", (data) => {
      console.log("🧩 Test event from frontend:", data);
      socket.emit("server:ack", { received: true });
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  io.on("alert:new", (data) => {
    console.log("📢 Alert received in socket layer:", data);
    io.to("global_alerts").emit("alert:new", data);
  });
}
