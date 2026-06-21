import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import SeatSelection from "./pages/SeatSelection";
import HostEvent from "./pages/HostEvent";
import OrganizerLanding from "./pages/OrganizerLanding";
import OrganizerLogin from "./pages/OrganizerLogin";
import MyBookings from "./pages/MyBookings";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import EditEvent from "./pages/EditEvent";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/events/:id/book" element={<SeatSelection />} />
      <Route path="/business" element={<OrganizerLanding />} />
      <Route path="/business/login" element={<OrganizerLogin />} />
      <Route path="/host-event" element={<HostEvent />} />
      <Route path="/bookings" element={<MyBookings />} />
      <Route path="/business/dashboard" element={<OrganizerDashboard />} />
      <Route path="/business/events/:id/edit" element={<EditEvent />} />
    </Routes>
  );
}

export default App;
