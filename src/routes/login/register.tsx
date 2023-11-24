import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom";
import axios_instance from "../../config/api_defaults";
import toast, { Toaster } from "react-hot-toast";
interface Register {
    email: string,
    password: string
}

interface RegistrationForm {
    company_name: string,
    name: string,
    password: string,
    email: string
}


const Register = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [registrationForm, setRegistrationForm] = useState<RegistrationForm>({
        "company_name": "",
        "name": "",
        "password": "",
        "email": "",
    });
    const openLogin = () => {
        navigate('/login');
    }
    const doRegister = () => {
        axios_instance().post('/auth/register', registrationForm).then(() => {

            navigate('/login?registration_success')
        }).catch((e) => {
            Object.keys(e.response.data.errors).forEach(field => {
                toast.error(`Field: ${field}, Error: ${e.response.data.errors[field].join(', ')}`);
            });
        })
    }
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        doRegister();
    }

    return (<>
        <Toaster />
        <div className="max-h-screen">
            <section className="flex min-h-screen items-center justify-center border-red-500 bg-gray-200">
                <div className="flex max-w-3xl rounded-2xl bg-gray-100 p-5 shadow-lg">
                    <div className="px-5 md:w-1/2">
                        <h2 className="text-2xl font-bold text-[#002D74]">{t('register.register')}</h2>
                        <p className="mt-4 text-sm text-[#002D74]">{t('register.register_text')}</p>
                        <form className="mt-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-gray-700">{t('common.email')}</label>
                                <input
                                    value={registrationForm.email}
                                    onChange={(e) => { setRegistrationForm((c) => c && { ...c, email: e.target.value }) }}
                                    type="email" name="" id="" placeholder="Enter Email Address" className="mt-2 w-full rounded-lg border bg-gray-200 px-4 py-3 focus:border-blue-500 focus:bg-white focus:outline-none" autoFocus required />
                            </div>

                            <div className="mt-4">
                                <label className="block text-gray-700">{t('common.your_name')}</label>
                                <input
                                    value={registrationForm.name}
                                    onChange={(e) => { setRegistrationForm((c) => c && { ...c, name: e.target.value }) }}
                                    type="text" name="" id="" placeholder={t('common.your_name')} className="mt-2 w-full rounded-lg border bg-gray-200 px-4 py-3 focus:border-blue-500 focus:bg-white focus:outline-none" required />
                            </div>
                            <div className="mt-4">
                                <label className="block text-gray-700">{t('common.company_name')}</label>
                                <input
                                    value={registrationForm.company_name}
                                    onChange={(e) => { setRegistrationForm((c) => c && { ...c, company_name: e.target.value }) }}
                                    type="text" name="" id="" placeholder={t('common.company_name')} className="mt-2 w-full rounded-lg border bg-gray-200 px-4 py-3 focus:border-blue-500 focus:bg-white focus:outline-none" required />
                            </div>
                            <div className="mt-4">
                                <label className="block text-gray-700">{t('common.password')}</label>
                                <input type="password"
                                    value={registrationForm.password}
                                    onChange={(e) => { setRegistrationForm((c) => c && { ...c, password: e.target.value }) }}
                                    name="" id="" placeholder={t('common.enter_password')} className="mt-2 w-full rounded-lg border bg-gray-200 px-4 py-3 focus:border-blue-500 focus:bg-white focus:outline-none" required />
                            </div>


                            <button type="submit" className="mt-6 block w-full rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white hover:bg-blue-400 focus:bg-blue-400">{t('register.register_button')}</button>
                        </form>

                        <div className="mt-3 flex items-center justify-between text-sm">
                            <p>{t('register.already_has_account')}</p>
                            <button onClick={() => { openLogin() }} className="ml-3 rounded-xl border border-blue-400 bg-white px-5 py-2 duration-300 hover:scale-110">{t('login.login_button')}</button>
                        </div>
                    </div>

                    <div className="hidden w-1/2 md:block">
                        <img src="https://image.similarpng.com/very-thumbnail/2020/12/Lorem-ipsum-logo-isolated-clipart-PNG.png" className="rounded-2xl" alt="page img" />
                    </div>
                </div>
            </section>
        </div>


    </>);


}
export default Register