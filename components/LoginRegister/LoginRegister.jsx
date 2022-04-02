import React from 'react';

import { Typography, TextField, Button } from '@material-ui/core';
import axios from "axios";


class LoginRegister extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loginUser: "",
            lastName: "",
            firstName: "",
            location: "",
            description: "",
            occupation: "",
            password: "",
            newPassword: "",
            newPasswordConfirm: "",
            newLoginUser: "",
        };
    }
    createNewUser(event) {
        event.preventDefault();
        let userData = {
            login_name: this.state.newLoginUser,
            first_name: this.state.firstName,
            last_name: this.state.lastName,
            location: this.state.location,
            description: this.state.description,
            occupation: this.state.occupation,
            password: this.state.newPassword
        };

        if (this.state.newPassword === this.state.newPasswordConfirm) {
            if (
                this.state.firstName &&
                this.state.lastName &&
                this.state.location &&
                this.state.description &&
                this.state.occupation &&
                this.state.newLoginUser &&
                this.state.newPassword &&
                this.state.newPasswordConfirm
            ) {
                axios.post('/user', { userData })
                    .then(() => {
                        this.setState({
                            loginUser: "",
                            lastName: "",
                            firstName: "",
                            location: "",
                            description: "",
                            occupation: "",
                            password: "",
                            newPassword: "",
                            newPasswordConfirm: "",
                            newLoginUser: "",
                        });
                        alert("Registered");
                    })
                    .catch(error => {
                        console.log(error.response.data);
                    });
            }
        } else {
            alert("password doesn't match");
            console.log("password doesn't match");
        }
    }

    userLogin(event) {
        event.preventDefault();
        axios.post("/admin/login", {
            login_name: this.state.loginUser,
            password: this.state.password
        }).then(info => {
            this.props.changeCurUser(info.data);
            this.props.changeLogin(true);
        }).catch(error => {
            console.log(error.response.data);
        });
    }
    updateChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    render() {
        return (
            <div className="appView">
                <div id="userLogInSession">
                    <Typography component='h1' variant='h5'>
                        Log In:
                    </Typography>
                    <form className="form" onSubmit={(event) => { this.userLogin(event); }}>
                        <TextField
                            required
                            id="loginUser"
                            name="loginUser"
                            type='text'
                            value={this.state.loginUser}
                            onChange={(event) => { this.updateChange(event); }}
                            label="User Name"
                            variant="outlined"
                        /><br />
                        <TextField
                            required
                            id="password"
                            name="password"
                            type="password"
                            value={this.state.password}
                            onChange={(event) => { this.updateChange(event); }}
                            label="Password"
                            variant="outlined"
                        />
                        <br />
                        <Button type="submit"
                            variant='contained'>
                            Log in
                        </Button>
                    </form>
                </div>
                <div id="userRegistrationSession">
                    <Typography component='h1' variant='h5'>
                        Register new user:
                    </Typography>
                    <form className="form" onSubmit={(event) => { this.createNewUser(event); }}>
                        <TextField
                            required
                            id="newLoginUser"
                            name="newLoginUser"
                            type='text'
                            value={this.state.newLoginUser}
                            onChange={(event) => { this.updateChange(event); }}
                            label="User Name"
                            variant="outlined"
                        /><br />
                        <TextField
                            required
                            id="newPassword"
                            name="newPassword"
                            value={this.state.newPassword}
                            onChange={(event) => { this.updateChange(event); }}
                            type='password'
                            label="Password"
                            variant="outlined"
                        /><br />
                        <TextField
                            required
                            id="newPasswordConfirm"
                            name="newPasswordConfirm"
                            value={this.state.newPasswordConfirm}
                            onChange={(event) => { this.updateChange(event); }}
                            type='password'
                            label="Confirm Password"
                            variant="outlined"
                        /><br />
                        <TextField
                            required
                            id="firstName"
                            name="firstName"
                            value={this.state.firstName}
                            onChange={(event) => { this.updateChange(event); }}
                            type='text'
                            label="First Name"
                            variant="outlined"
                        /><br />
                        <TextField
                            required
                            id="lastName"
                            name="lastName"
                            value={this.state.lastName}
                            onChange={(event) => { this.updateChange(event); }}
                            type='text'
                            label="Last Name"
                            variant="outlined"
                        /><br />
                        <TextField
                            required
                            id="location"
                            name="location"
                            value={this.state.location}
                            onChange={(event) => { this.updateChange(event); }}
                            type='text'
                            label="Location"
                            variant="outlined"
                        /><br />
                        <TextField
                            required
                            id="description"
                            name="description"
                            value={this.state.description}
                            onChange={(event) => { this.updateChange(event); }}
                            type='text'
                            label="Description"
                            variant="outlined"
                        /><br />
                        <TextField
                            required
                            id="occupation"
                            name="occupation"
                            value={this.state.occupation}
                            onChange={(event) => { this.updateChange(event); }}
                            type='text'
                            label="Occupation"
                            variant="outlined"
                        /><br />
                        <Button type="submit"
                            variant='contained'>
                            Register
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

}
export default LoginRegister;