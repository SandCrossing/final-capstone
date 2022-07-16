const knex = require("../db/connection");

const getAllReservations = async (date) => {
    return await knex("reservations")
        .select("*")
        .whereNot('status', 'finished')
        .where({'reservation_date': date})
        .orderBy('reservation_time')
        .returning('*')
};

const findWithMobileNumber = (mobile_number) =>
    knex("reservations")
        .whereRaw(
         "translate(mobile_number, '() -', '') like ?",
         `%${mobile_number.replace(/\D/g, "")}%`
        )
        .orderBy("reservation_date")
 
        
function create(newReservation) {
    return knex("reservations")
        .insert(newReservation)
        .returning("*");
};

function read(reservation_id) {
    return knex("reservations")
        .select("*")
        .where({reservation_id})
        .first();
};

const update = (reservation_id, updatedReservation) =>
    knex('reservations')
        .where('reservation_id', reservation_id)
        .update(updatedReservation)
        .returning(['first_name', 'last_name', 'mobile_number', 'people', 'reservation_date', 'reservation_time']);

const updateStatus = (reservation_id, status) =>
    knex('reservations')
        .where('reservation_id', reservation_id)
        .update({ status: status })
        .returning('status');



module.exports ={
    getAllReservations,
    findWithMobileNumber,
    read, 
    create,
    update, 
    updateStatus
};