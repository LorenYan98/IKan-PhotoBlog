import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Typography, Paper
} from '@material-ui/core';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/LoginRegister/LoginRegister';
import Favorite from './components/favorite/Favorite';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      currentUser: undefined
    };
    this.changeCurUser = this.changeCurUser.bind(this);
    this.changeLogin = this.changeLogin.bind(this);
  }
  changeCurUser(newUser) {
    this.setState({ currentUser: newUser });
  }
  changeLogin(isLogin) {
    this.setState({ isLoggedIn: isLogin });
  }


  showUserListInfo() {
    let userListInfo = (
      <Grid item sm={3}>
        <Paper className="cs142-main-grid-item">
          <UserList />
        </Paper>
      </Grid>
    );
    return this.state.isLoggedIn ? userListInfo : null;
  }
  showDetailInfo() {
    let detailInfo = (
      <Grid item sm={9}>
        <Paper className="cs142-main-grid-item">
          <Switch>
            <Route exact path="/"
              render={() => (
                <Typography variant="body1">
                  Welcome to your photosharing app! This <a href="https://mui.com/components/paper/">Paper</a> component
                  displays the main content of the application. The {"sm={9}"} prop in
                  the <a href="https://mui.com/components/grid/">Grid</a> item component makes it responsively
                  display 9/12 of the window. The Switch component enables us to conditionally render different
                  components to this part of the screen. You don&apos;t need to display anything here on the homepage,
                  so you should delete this Route component once you get started.
                </Typography>
              )}
            />
            <Route path="/users/:userId"
              render={props => (
                <UserDetail {...props}
                  changeLogin={this.changeLogin} />
              )}
            />
            <Route path="/photos/:userId"
              render={props => <UserPhotos {...props} />}
            />
            <Route path="/favorite"
              render={props => <Favorite {...props} />}
            />
            <Route path="/users" component={UserList} />
          </Switch>
        </Paper>
      </Grid>
    );
    return this.state.isLoggedIn ? detailInfo :
      <Redirect to="/login-register" />;
  }

  render() {
    return (
      <HashRouter>
        <div>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <Route path="/*"
                render={props => (
                  <TopBar
                    {...props}
                    isLoggedIn={this.state.isLoggedIn}
                    changeLogin={this.changeLogin}
                    currentUser={this.state.currentUser} />
                )}
              />
            </Grid>
            {this.showUserListInfo()}
            <div className="cs142-main-topbar-buffer" />

            <Grid item sm={9}>
              {this.showDetailInfo()}
            </Grid>
            <Grid item sm={12}>
              {!this.state.isLoggedIn ? (
                <Route path="/login-register"
                  render={props => (
                    <LoginRegister
                      {...props}
                      changeCurUser={this.changeCurUser}
                      changeLogin={this.changeLogin}
                    />
                  )}
                />
              ) : (
                <Redirect to="/"></Redirect>
              )}

            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
