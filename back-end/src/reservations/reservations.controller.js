
const service = require("./reservations.service")
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function reservationExists (req, res, next) {
  const { reservation_id } = req.params;
  const data = await service.read(reservation_id)
  if (data) {
    res.locals.reservation = data;
    return next();
  }
  next({status: 404, message: `Reservation ${reservation_id} cannot be found`})
}

async function validForm(req, res, next) {
  if (!req.body.data) return next({ status: 400, message: 'Data Missing!' });

  const { first_name, last_name, mobile_number, people, reservation_date, reservation_time, status } = req.body.data;

  if (!first_name)
    return next({ status: 400, message: 'Error: var first_name must exist' });

  if (!last_name)
    return next({ status: 400, message: 'Error: var last_name must exist' });

  if (!mobile_number)
    return next({ status: 400, message: 'Error: var mobile_number must exist' });

  if (!people)
    return next({ status: 400, message: 'Error: var people must exist' });

  if (!reservation_date)
    return next({ status: 400, message: 'Error: var reservation_date must exist' });

  if (!reservation_time)
    return next({ status: 400, message: 'Error: var reservation_time must exist' });

  if (!reservation_date.match(/\d{4}-\d{2}-\d{2}/))
    return next({ status: 400, message: 'Error: var reservation_date must be in valid format' });

  if (!reservation_time.match(/\d{2}:\d{2}/))
    return next({ status: 400, message: 'Error: var reservation_time must be in valid format' });

  if (typeof people !== 'number')
    return next({ status: 400, message: 'Error: var people must be a number' });

  if (status === 'seated')
    return next({ status: 400, message: 'Error: var status cannot be set to seated' });

  if (status === 'finished')
    return next({ status: 400, message: 'Error: var status cannot be set to finished' });

  res.locals.reservation = { first_name, last_name, mobile_number, people, reservation_date, reservation_time };
  next();
}

async function validDate(req, res, next) {
  const date = new Date(res.locals.reservation.reservation_date);
  const currentDate = new Date();

  if (date.getUTCDay() === 2)
    return next({ status: 400, message: "Error: Restaurant is closed on Tuesdays" });

  if (date.valueOf() < currentDate.valueOf() && date.toUTCString().slice(0, 16) !== currentDate.toUTCString().slice(0, 16))
    return next({ status: 400, message: "Error: Reservations must be made for a future date and time" });

  next();
}


function validTime(req, res, next) {
  const time = res.locals.reservation.reservation_time;
  let hour = time[0] + time[1];
  let minutes = time[3] + time[4];
  hour = Number(hour);
  minutes = Number(minutes);

  const currentTime = req.body.data.current_time;
  const date = new Date(res.locals.reservation.reservation_date);
  const currentDate = new Date();

  if (currentTime > time && date.toUTCString().slice(0, 16) === currentDate.toUTCString().slice(0, 16))
    return next({ status: 400, message: "Error: Reservations must be made for a future date and time" });

  if (hour < 10 || (hour <= 10 && minutes < 30))
    return next({ status: 400, message: "Error: Reservation must be made for restaurant's operating hours" });

  if (hour > 21 || (hour >= 21 && minutes > 30))
    return next({ status: 400, message: "Error: Reservation must be made for restaurant's operating hours" });

  next();
}


async function validStatusUpdate(req, res, next) {
  const currentStatus = res.locals.reservation.status;
  const { status } = req.body.data;

  if (currentStatus === 'finished')
    return next({ status: 400, message: 'Error: Reservations with status finished cannot be updated' })

  if (status === 'cancelled')
    return next();

  if (status !== 'booked' && status !== 'seated' && status !== 'finished')
    return next({ status: 400, message: 'Error: Cannot update a reservation with unknown status' });

  next();
}

async function validUpdate(req, res, next) {
  if (!req.body.data) return next({ status: 400, message: 'Data Missing!' });

  const { first_name, last_name, mobile_number, people, reservation_date, reservation_time } = req.body.data;

  if (!first_name)
    return next({ status: 400, message: 'Error: var first_name must exist' });

  if (!last_name)
    return next({ status: 400, message: 'Error: var last_name must exist' });

  if (!mobile_number)
    return next({ status: 400, message: 'Error: var mobile_number must exist' });

  if (!people)
    return next({ status: 400, message: 'Error: var people must exist' });

  if (!reservation_date)
    return next({ status: 400, message: 'Error: var reservation_date must exist' });

  if (!reservation_time)
    return next({ status: 400, message: 'Error: var reservation_time must exist' });

  if (!reservation_date.match(/\d{4}-\d{2}-\d{2}/))
    return next({ status: 400, message: 'Error: var reservation_date must be in valid format' });

  if (!reservation_time.match(/\d{2}:\d{2}/))
    return next({ status: 400, message: 'Error: var reservation_time must be in valid format' });

  if (typeof people !== 'number')
    return next({ status: 400, message: 'Error: var people must be a number' });

  res.locals.reservation = { first_name, last_name, mobile_number, people, reservation_date, reservation_time };

  next();
}





async function list(req, res, next) {
  const date = req.query.date;
  const mobile_number = req.query.mobile_number;
  if (date) {
    let reservations = await service.getAllReservations(date);
    res.json({
      data: reservations,
    });

  } else if (mobile_number) {
    res.json({ data: await service.findWithMobileNumber(mobile_number)});
    return;
  } 

}



async function create(req, res) {
  const data = await service.create(res.locals.reservation);
  res.status(201).json({data: data[0]})
}

async function read(req, res) {
  const {reservation} = res.locals;
  res.status(200).json({ data: reservation})
}

async function update(req, res) {
  const { reservation_id } = req.params;
  const data = await service.update(reservation_id, res.locals.reservation);
  res.status(200).json({
    data: data[0],
  });
}

async function updateStatus(req, res) {
  const { reservation_id } = req.params;
  const status = req.body.data.status;
  const data = await service.updateStatus(reservation_id, status);

  res.status(200).json({
    data: { status: data[0] },
  });
}




module.exports = {
  list: [asyncErrorBoundary(list)],
  read: [ asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)], 
  create: [ asyncErrorBoundary(validForm), asyncErrorBoundary(validDate), asyncErrorBoundary(validTime), asyncErrorBoundary(create)], 
  updateStatus: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(validStatusUpdate), asyncErrorBoundary(updateStatus)],
  update: [ asyncErrorBoundary(reservationExists), asyncErrorBoundary(validUpdate), asyncErrorBoundary(validDate), asyncErrorBoundary(validTime), asyncErrorBoundary(update)], 
  
};
