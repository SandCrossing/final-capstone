import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation } from "react-router-dom";
import { today, next, previous, formatDate } from "../utils/date-time";
import Reservation from "./Reservation";
import Tables from "./Tables";

function Dashboard() {
  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }
  const query = useQuery();
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
  const [date, setDate] = useState(query.get("date") || today());

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    listTables(abortController.signal).then(setTables).catch(setTablesError);
    return () => abortController.abort();
  }

  return (
    <main className="text-center">
      <h1 className="m-3">{formatDate(date)}</h1>
      <button onClick={() => setDate(previous(date))} className="btn btn-secondary">Previous Day</button>
      <button className="mx-3 btn btn-primary" onClick={() => setDate(today())}>Today</button>
      <button onClick={() => setDate(next(date))} className="btn btn-secondary">Next Day</button>
      <br />
      <div className="d-md-flex mb-3 "></div>
      <ErrorAlert error={reservationsError} />
      <ErrorAlert error={tablesError} />
      <h2>Available Tables</h2>
      <div className="d-flex justify-content-center mb-1 flex-wrap">
        {tables.map((table) => (
          <Tables key={table.table_id} table={table} />
        ))}
      </div>
      {reservations.length ? (
        <h2>Listed Reservations</h2>
      ) : (
        <h4>No reservations for {date}</h4>
      )}
      <div className="d-flex justify-content-center flex-wrap">
        {reservations.map((reservation) => (
          <Reservation
            key={reservation.reservation_id}
            reservation={reservation}
          />
        ))}
      </div>
    </main>
  );
}

export default Dashboard;
