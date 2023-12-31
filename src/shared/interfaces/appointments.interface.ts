interface Appointment {
    user_id:string,
    price: string,
    amount_paid?:string,
    due_amount:string,
    paid_at?:string,
    employee_id?:string,
    title:string,
    start: string,
    end: string,
    color?:string,
    remind_client: boolean,
    item_id?: string,
    status:string,
    end_formatted?:string,
    start_formatted?:string
    note?:string
    remind_setting: AppointmentRemindSettings
}

interface AppointmentRemindSettingsType {
    remind_day_before: boolean,
    remind_same_day: boolean,
    remind_now: boolean,
    remind_for_upcoming: boolean,
    settings_for_upcoming: AppointmentUpcomingSettings
}
interface AppointmentUpcomingSettings {
    date: string,
    custom_text_message: string
}


export type AppointmentType = Appointment;
export type AppointmentRemindSettings = AppointmentRemindSettingsType;

