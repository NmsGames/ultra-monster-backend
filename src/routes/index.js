import React, { Component } from 'react';
import { register } from '../../actions/auth';
import { useDispatch, useSelector } from "react-redux";


const Register = (props) => {
    const [state, setState] = useState({
        username: '',
        password1: '',
        password2: '',
    });
    const onChange = (e) => {
        let field_name = e.target.name;
        let field_value = e.target.value;
        setState(prev => ({ ...prev, [field_name]: field_value });
    }
    const dispatch = useDispatch();
    const onSubmit = (e) => {
        e.preventDefault()
        console.log(props)
        if (state.password1 === state.password2) {
            dispatch(register(state))
        }
        else {
            console.log('Psw did not matched.')
        }
    }
    return (
        <div className="col-md-6 m-auto">
            <div className="card card-body mt-5">
                <h2 className="text-center">Register</h2>
                <form encType="multipart/form-data" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            className="form-control"
                            name="username"
                            value={state.username}
                            onChange={onChange}
                            required />
                    </div>
                    <div className="form-group">
                        <label> Password</label>
                        <input
                            type="password"
                            className="form-control"
                            name="password1"
                            value={state.password1}
                            onChange={onChange}
                            required />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            name="password2"
                            value={state.password2}
                            onChange={onChange}
                            required />
                    </div>
                    <div className="form-group">
                        <button type="submit" className="btn btn-primary">Register</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default Register;