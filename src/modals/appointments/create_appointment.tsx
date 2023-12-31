import { Button, Dialog, Flex, Switch } from "@radix-ui/themes";
import { useState, useEffect, FormEvent } from "react";
import axios_instance from "../../config/api_defaults";
import { AppointmentType } from "../../shared/interfaces/appointments.interface";
import Select, { SingleValue } from 'react-select'
import { ServiceType } from "../../shared/interfaces/service.interface";
import toast from "react-hot-toast";
import { EmployeeDTO } from "../../shared/interfaces/employees.interface";
import CreateClientModal, { ClientCreateDTO } from "../clients/create_client_modal";
import { TransformedDataForSelect } from "../../shared/interfaces/select_box.interface";
import { useTranslation } from "react-i18next";
import { ClientDTO } from "../../shared/interfaces/client.interface";
import CreateItemModal from "../items/create_item_modal";
import { ItemDTO } from "../../shared/interfaces/item.interface";
import { useQueryClient } from "react-query";

interface CreateAppointmentModalProps {
    cancelFunction: () => void,
    saveFunction: () => void,
    isOpen: boolean,
    appointment_data: {
        start: string,
        end: string
    }
}

const CreateAppointmentModal = (props: CreateAppointmentModalProps) => {
    const blankForm = {
        user_id: "",
        item_id: "",
        employee_id: "",
        due_amount: "",
        title: "",
        status: "pending",
        start: props?.appointment_data?.start,
        end: props?.appointment_data?.end,
        price: "",
        color: "#00D14D",
        remind_client: true,
        remind_setting: {
            remind_day_before: false,
            remind_same_day: false,
            remind_now: false,
            remind_for_upcoming: false,
            settings_for_upcoming: {
                date: "",
                custom_text_message: "",
            }
        },
        note: "",
    }
    const [form, setForm] = useState<AppointmentType>({
        user_id: "",
        item_id: "",
        employee_id: "",
        title: "",
        due_amount: "",
        start: props?.appointment_data?.start,
        end: props?.appointment_data?.end,
        price: "",
        status: "pending",
        color: "#00D14D",
        remind_client: true,
        remind_setting: {
            remind_day_before: true,
            remind_same_day: false,
            remind_now: true,
            remind_for_upcoming: false,
            settings_for_upcoming: {
                date: "",
                custom_text_message: "",
            }
        },
        note: "",
    });
    const { t } = useTranslation();
    const [clientList, setClientList] = useState<ClientDTO[]>([]);
    const [serviceList, setServiceList] = useState<ServiceType[]>([]);
    const [employeeList, setEmployeeList] = useState<EmployeeDTO[]>([]);
    const [clientTransformedList, setClientTransformedList] = useState<TransformedDataForSelect[]>();
    const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
    const [isCreateServiceModalOpen, setIsCreateServiceModalOpen] = useState(false);
    const [hasValidationErrors, setHasValidationErrors] = useState(false);
    const queryClient = useQueryClient();

    const [selectedClient, setSelectedClient] = useState<TransformedDataForSelect>(
        {
            label: t('appointment.select_client'),
            value: 0,
        }
    );

    const [selectedService, setSelectedService] = useState<TransformedDataForSelect>(
        {
            label: t('appointment.select_service'),
            value: 0,
        }
    );
    const servicesTransformed = serviceList.map((element: ServiceType) => ({
        value: element.id,
        label: element.name
    }));

    const employeesTransformed = employeeList.map((element) => ({
        value: element.id,
        label: element.name
    }));

    const transformClientList = (clients: ClientDTO[]) => {
        const transformed = clients.map((element) => ({
            value: element.id,
            label: element.name
        }));
        setClientTransformedList(transformed)

    }

    const myFetchFunc = () => {
        axios_instance().get('/clients').then(response => {
            setClientList(response.data);

            transformClientList(response.data)
        })
        axios_instance().get('/items?type=service').then(response => {
            setServiceList(response.data);
        })
        axios_instance().get('/employees').then(response => {
            setEmployeeList(response.data);
        })
    }

    useEffect(() => {
        myFetchFunc();
    }, [])

    useEffect(() => {
        setForm((c) => c && { ...c, start: props?.appointment_data?.start });
        setForm((c) => c && { ...c, end: props?.appointment_data?.end });
    }, [props?.appointment_data?.start, props?.appointment_data?.end]);

    const setServiceForm = (e: SingleValue<{ value: string | number; label: string; }>) => {
        if (e) {
            const service = serviceList.filter(service => service.id === e.value)[0];

            setForm((c) => c && { ...c, color: service.color })

            setForm((c) => c && { ...c, item_id: e.value.toString() })
            if (!form.price) {
                setForm((c) => c && { ...c, price: service.price })
            } else {
                if (serviceList.some(service => service.price === form.price)) {
                    setForm((c) => c && { ...c, price: service.price });
                }
            }
            if (!form.title) {
                setForm((c) => c && { ...c, title: e.label });
            } else {
                if (servicesTransformed.some(service => service.label === form.title)) {
                    setForm((c) => c && { ...c, title: e.label });
                }
            }
        }
    }

    const setClientForm = (e: SingleValue<{ value: number | string; label: string; }>) => {
        if (e) {
            const client = clientList.filter(client => client.id === e.value)[0];
            setSelectedClient((c) => c && { ...c, value: e.value });
            setSelectedClient((c) => c && { ...c, label: e.label });
            setForm((c) => c && { ...c, user_id: client.id.toString() });

            setForm((c) => c && { ...c, remind_client: client.settings.receive_sms })
            setForm((c) => c && { ...c, remind_setting: { ...c.remind_setting, remind_day_before: client.settings.sms_remind_day_before } })
            setForm((c) => c && { ...c, remind_setting: { ...c.remind_setting, remind_same_day: client.settings.sms_remind_same_day } })
        }
    }

    const setEmployeeForm = (e: SingleValue<{ value: string; label: string; }>) => {
        if (e) {
            setForm((c) => c && { ...c, employee_id: e.value.toString() });
        }
    }

    const saveAppointment = () => {
        axios_instance().post('/appointments', form).then((response) => {
            if (response.status === 200) {
                toast.success(t('toasts.appointment_created'));
                setForm(blankForm);
                setHasValidationErrors(false);
                setSelectedClient(
                    {
                        label: t('appointment.select_client'),
                        value: 0,
                    }
                )
                props?.saveFunction();

            }
        }).catch(() => {
            setHasValidationErrors(true);
        })
    }
    const setActiveClient = (r: ClientDTO) => {
        setSelectedClient((c) => c && { ...c, label: r.name })
        setSelectedClient((c) => c && { ...c, value: r.id })
        setForm((c) => c && { ...c, user_id: r.id.toString() });
    }
    const setActiveService = (r: ItemDTO) => {
        setSelectedService((c) => c && { ...c, label: r.name })
        setSelectedService((c) => c && { ...c, value: parseInt(r.id) })
        setForm((c) => c && { ...c, item_id: r.id.toString() });
    }
    const cancelAction = () => {
        setIsCreateClientModalOpen(false);
    }
    const cancelServiceOpenModal = () => {
        setIsCreateServiceModalOpen(false);
    }

    const saveRecord = (form: ClientCreateDTO) => {
        axios_instance().post('/clients', form).then((r) => {
            setIsCreateClientModalOpen(false);
            myFetchFunc();
            setActiveClient(r.data)
        })
    }
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        saveAppointment()
    }

    const saveItemAndInject = (form: ItemDTO) => {
        axios_instance().post('/items', form).then((r) => {
            myFetchFunc();
            setIsCreateServiceModalOpen(false);
            setActiveService(r.data)
            queryClient.invalidateQueries({
                queryKey: ['services'],
            })
        });
    }

    return (<>
        <CreateItemModal
            saveFunction={(form) => { saveItemAndInject(form) }}
            isOpen={isCreateServiceModalOpen}
            modalType="service"
            cancelFunction={cancelServiceOpenModal} />
        <CreateClientModal saveFunction={saveRecord} cancelFunction={cancelAction} isOpen={isCreateClientModalOpen}></CreateClientModal>
        <Dialog.Root open={props.isOpen} >

            <Dialog.Content style={{ maxWidth: 450 }}>
                <Dialog.Title>{t('appointment.create_appointment_modal_title')}</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    {hasValidationErrors &&
                        <p className="text-red-500 text-sm">{t('appointment.enter_client')}</p>
                    }

                </Dialog.Description>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>{t('appointment.name')}<span className="text-red-600">*</span></label>
                        <input
                            required={true}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                            placeholder="Title"
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm((c) => c && { ...c, title: e.target.value })} />
                    </div>

                    <div>
                        <div className="flex justify-between">
                            <label>{t('appointment.service')}</label>
                            <p className="hover:cursor-pointer text-green-700 font-bold pt-1 text-md" onClick={() => { setIsCreateServiceModalOpen(true) }}>Dodaj</p>
                        </div>

                        <Select
                            value={selectedService}
                            onChange={(e) => { setServiceForm(e) }}
                            options={servicesTransformed} />
                    </div>

                    <div>
                        <label>{t('appointment.employee')}</label>
                        <Select onChange={(e) => { setEmployeeForm(e) }} options={employeesTransformed} />
                    </div>

                    <div>

                        <div className="flex justify-between">
                            <label>{t('common.client')} <span className="text-red-600">*</span></label>
                            <p className="hover:cursor-pointer text-green-700 font-bold pt-1 text-md" onClick={() => { setIsCreateClientModalOpen(true) }}>Dodaj</p>
                        </div>
                        <Select
                            required={true}
                            value={selectedClient}
                            options={clientTransformedList}
                            onChange={(e) => { setClientForm(e) }} />
                    </div>


                    {form.user_id &&
                        <div>
                            <label>{t('appointment.remind_client')}</label>
                            <Switch
                                checked={form.remind_client}
                                onCheckedChange={(checked) => setForm((c) => c && { ...c, remind_client: checked })}
                            />
                        </div>
                    }

                    {form.user_id && form.remind_client && (
                        <>
                            <div>
                                <label>{t('appointment.remind_day_before')}</label>
                                <Switch
                                    checked={form?.remind_setting?.remind_day_before}
                                    onCheckedChange={(check) => setForm((c) => c && { ...c, remind_setting: { ...c.remind_setting, remind_day_before: check } })}
                                />
                            </div>
                            <div>
                                <label>{t('appointment.remind_same_day')}</label>
                                <Switch
                                    checked={form.remind_setting.remind_same_day}
                                    onCheckedChange={(check) => setForm((c) => c && { ...c, remind_setting: { ...c.remind_setting, remind_same_day: check } })}
                                />
                            </div>
                            <div>
                                <label>{t('appointment.send_confirmation_client')}</label>
                                <Switch
                                    checked={form.remind_setting.remind_now}
                                    onCheckedChange={(check) => setForm((c) => c && { ...c, remind_setting: { ...c.remind_setting, remind_now: check } })}
                                />
                            </div>
                            {/* <div>
                            <label> Remind for upcoming</label>
                            <Switch
                                checked={form?.remind_settings?.remind_for_upcoming}
                                onCheckedChange={(checked) => setForm((c) => c && { ...c, remind_settings: { ...c.remind_settings, remind_for_upcoming: checked } })}
                            />
                        </div> */}
                        </>
                    )}
                    <div>
                        <label>{t('common.price')} <span className="text-red-600">*</span></label>
                        <input
                            type="number"
                            required={true}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                            value={form.price}
                            onChange={(e) => setForm((c) => c && { ...c, price: e.target.value })} />

                    </div>
                    <div className="pt-2">
                        <label>{t('appointment.color')}:</label>
                        <input type="color"
                            onChange={(e) => setForm((c) => c && { ...c, color: e.target.value })}
                            value={form.color} />
                    </div>


                    <Flex gap="3" mt="4" justify="end">
                        <Dialog.Close>
                            <Button onClick={props.cancelFunction} variant="soft" color="gray">
                                {t('common.cancel')}
                            </Button>
                        </Dialog.Close>
                        <Dialog.Close>
                            <Button type="submit" >{t('common.save')}</Button>
                        </Dialog.Close>
                    </Flex>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    </>)
}

export default CreateAppointmentModal