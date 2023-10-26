import { Eye, Plus, Trash } from "react-feather";
import DataTable, { Action, ActionTypes, Field, TableAction } from "../../../components/datatable";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CreateEmployeeModal from "../../../modals/employees/create_employee_modal";
import SweetAlert2 from "react-sweetalert2";
import axios_instance from "../../../config/api_defaults";
import { useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { EmployeeDTO } from "../../../shared/interfaces/employees.interface";

const Employees = () => {

    const [isCreateEmployeeModalOpen, setisCreateEmployeeModalOpen] = useState(false);
    const [swalProps, setSwalProps] = useState({});
    const queryClient = useQueryClient();
    const openEmployeeCreateModal = () => {
        setisCreateEmployeeModalOpen(true);
    };

    const closeEmployeeCreateModal = () => {
        setisCreateEmployeeModalOpen(false);
    };


    const navigate = useNavigate();
    const url = "employees?per_page=5"
    const tableActions: TableAction[] = [
        {
            icon: <Plus></Plus>,
            fn: () => { openEmployeeCreateModal() }
        }
    ]
    const actions: Action<EmployeeDTO>[] = [
        {
            type: ActionTypes.Show,
            icon: <Eye color="lightblue"></Eye>,
            fn: (employee: EmployeeDTO) => navigate(`/employees/${employee.id}/details/`),
        },
        {
            type: ActionTypes.Delete,
            icon: <Trash color="red"></Trash>,
            fn: (employee: EmployeeDTO) => { employee.id && raiseDeleteAlert(employee.id) }
        },
    ];
    function setSwalOff() {
        const dataCopied = JSON.parse(JSON.stringify(swalProps));
        dataCopied.show = false;
        setSwalProps(dataCopied);
    }

    const raiseDeleteAlert = (id: string) => {
        setSwalProps({
            show: true,
            icon: 'error',
            title: 'Please confirm',
            text: 'This action is unreversible and it will delete employee with  all records associated with him',
            cancelButtonColor: "green",
            reverseButtons: true,
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: "Go for it",
            confirmButtonColor: "red",
            onConfirm: () => { deleteEmployee(id) },
            onResolve: setSwalOff
        });

    }
    const fields: Field[] = [
        {
            name: "name",
            editable_from_table: false,
            original_name: "name",
            has_sort: false,
            show: true
        },
        {
            name: "email",
            editable_from_table: false,
            original_name: "email",
            has_sort: false,
            show: true,
        },
        {
            name: "note",
            editable_from_table: false,
            original_name: "note",
            has_sort: false,
            show: true,
        },
        {
            name: "Deskripcija posla",
            editable_from_table: false,
            original_name: "job_description",
            has_sort: false,
            show: true,
        },
        // {
        //     name: "Ukljucen login",
        //     editable_from_table: false,
        //     original_name: "login_enabled",
        //     has_sort: false,
        //     show: true,
        // },

    ]

    const deleteEmployee = (id: string) => {
        axios_instance.delete(`/employees/${id}`).then(() => {
            toast.success('Employee deleted succesfully');
            queryClient.invalidateQueries();

        }).catch((e) => {
            toast.error(e.response.message)
        })
    }

    const cancelAction = () => {
        closeEmployeeCreateModal();
    }

    const saveRecord = (form: EmployeeDTO) => {
        //todo see what tf is going on in here
        axios_instance.post('/employees', form).then(() => {
            queryClient.invalidateQueries();
            closeEmployeeCreateModal();
        })
    }
    return (
        <>
            <SweetAlert2 {...swalProps} />
            <CreateEmployeeModal saveFunction={saveRecord} cancelFunction={cancelAction} isOpen={isCreateEmployeeModalOpen} ></CreateEmployeeModal>
            <div className="py-12">
                <DataTable table_actions={tableActions} actions={actions} url={url} fields={fields} table_name="Lista zaposlenih" has_actions={true} ></DataTable>
            </div>
        </>
    )
}
export default Employees;