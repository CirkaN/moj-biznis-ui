import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridWeek from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction';
import { useState } from 'react';
import CreateAppointmentModal from '../../modals/appointments/create_appointment';
import axios_instance from '../../config/api_defaults';
import { toast } from 'react-hot-toast';
import { EventChangeArg } from '@fullcalendar/core/index.js';
import ShowAppointmentModal from '../../modals/appointments/show_appointment';
import { useQuery, useQueryClient } from 'react-query';
import { t } from 'i18next';
import useScreenSize from '../../hooks/useScreenSize';

interface AppointmentInterface {
  title: string | undefined,
  start: string,
  end: string,
  price: number | null,
  remind_client: boolean
}

interface BackendResponse {
  data: dataFromBackend[];
}

interface dataFromBackend {
  id: string,
  title: string | undefined,
  client_name: string,
  start: string,
  end: string,
  price: number | null,
  color: string,
  remind_client: boolean,
  paid_at: string,
}

interface calendarDate {
  title: string,
  start: string | Date,
  end: string | Date,
  price: number | string | null,
  color: string,
  client_name:string,

}

const MyCalendar = () => {

  const screenSize = useScreenSize();
  const [dates, setDates] = useState<calendarDate[]>([]);
  const [isCreateAppointmentModalOpen, setIsCreateAppointmentModalOpen] = useState(false);
  const [isShowAppointmentModalOpen, setIsShowAppointmentModalOpen] = useState(false);
  const [showAppointmentId, setShowAppointmentId] = useState<string>("");
  const [createAppointmentData, setCreateAppointmentData] = useState<AppointmentInterface>({ title: "", start: new Date().toISOString(), end: new Date().toISOString(), price: 0, remind_client: false });



  const queryClient = useQueryClient();

  useQuery({
    queryKey: ['appointment_list'],
    queryFn: () => {
      return axios_instance().get('appointments')
        .then(response => { mutateDates(response.data) })
    }
  })

  const setAppointmentData = (data: AppointmentInterface) => {
    setCreateAppointmentData(data);
  };

  const openAppointmentCreateModal = () => {
    setIsCreateAppointmentModalOpen(true);
  };

  const closeAppointmentCreateModal = () => {
    setIsCreateAppointmentModalOpen(false);
  };

  const mutateDates = (dataFromBackend: BackendResponse) => {

    console.log(dataFromBackend);

    const s = dataFromBackend.data.map(item => ({
      start: new Date(item.start),
      client_name: item.client_name,
      end: new Date(item.end),
      title: item.title ?? 'Nema imena',
      id: item.id,
      price: item.price,
      color: item.color,
      editable: item.paid_at ? false : true
    }));
    setDates(s);
  }


  const reRenderTable = () => {
    setIsCreateAppointmentModalOpen(false);
    setIsShowAppointmentModalOpen(false);
    queryClient.invalidateQueries(['appointment_list']);
  }

  const closeShowModal = () => {
    setIsShowAppointmentModalOpen(false);
  }

  const gridView = () => {
    if (screenSize.width < 700) {
      return 'timeGridDay';
    } else {
      return 'timeGridWeek';
    }
  }

  return (
    <>
      <ShowAppointmentModal eventUpdated={reRenderTable} cancelFunction={closeShowModal} appointmentId={showAppointmentId} isOpen={isShowAppointmentModalOpen}></ShowAppointmentModal>
      <CreateAppointmentModal appointment_data={createAppointmentData} cancelFunction={cancelAction} saveFunction={reRenderTable} isOpen={isCreateAppointmentModalOpen} />
      <div className="h-screen">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridWeek]}
          initialView={gridView()}
          buttonText={{
            today: "Danas",
            week: "Nedeljni prikaz",
            day: "Dnevni prikaz",
            month: "Mesecni prikaz"
          }}
          headerToolbar={{
            left: 'prev,next',
            right: 'timeGridWeek,timeGridDay,dayGridMonth'
          }}
          weekends={true}
          longPressDelay={500}
          locale='sr-latn'
          events={dates}
          editable={true}
          nowIndicator={true}
          selectable={true}
          eventContent={(e) => renderEventContent(e.timeText, e.event.title, e.event.extendedProps.client_name)}
          eventDrop={(e) => { handleDrop(e.event.startStr, e.event.endStr, e.event.id) }}
          select={(e) => handleSelect(e.startStr, e.endStr)}
          eventClick={(e) => handleClick(e.event.id)}
          eventResize={(e) => handleEventResizeStop(e.event.startStr, e.event.endStr, e.event.id, e.revert as unknown as EventChangeArg)}
        />
      </div>


    </>
  )


  function cancelAction() {
    closeAppointmentCreateModal();
  }


  function handleClick(id: string) {
    setShowAppointmentId(id);
    setIsShowAppointmentModalOpen(true);
  }

  function handleSelect(start: string, end: string) {

    const preparedJson: AppointmentInterface = {
      start: start,
      end: end,
      title: "",
      price: null,
      remind_client: true
    };

    setAppointmentData(preparedJson);
    openAppointmentCreateModal();
  }

  function handleDrop(start: string, end: string, id: string) {
    const jsonPrepared = {
      start: start,
      end: end,
      update_via: 'drop',
    }

    axios_instance().put('appointments/' + id, jsonPrepared).then(response => {
      if (response.status === 200) {
        toast.success(t('toasts.event_succesfully_updated'))
      }
    })
  }

  function handleEventResizeStop(startStr: string, endStr: string, id: string, revert: EventChangeArg) {
    if (!confirm("Are you sure you want to update the event?")) {
      revert.revert();
    } else {
      const json = {
        start: startStr,
        update_via: 'drop',
        end: endStr,
      }

      axios_instance().put('appointments/' + id, json).then(response => {
        if (response.status === 200) {
          toast.success(t('toasts.event_succesfully_updated'))
          queryClient.invalidateQueries()
        }
      })
    }
  }

  function renderEventContent(timeText: string, title: string, client_name: string) {


    return (
      <>
        <p>{timeText}[{client_name}]</p>
        <i className='text-md font-semibold ml-1'>{title}</i>
      </>
    )
  }
}



export default MyCalendar
