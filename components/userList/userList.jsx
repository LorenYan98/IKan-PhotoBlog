import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
}
  from '@material-ui/core';
import './userList.css';
import { Link } from 'react-router-dom';
import axios from "axios";

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    // let userlistModel = window.cs142models.userListModel();
    this.state = {
      userlistModel: []
    };
  }
  componentDidMount() {
    axios.get("/user/list").then((res) => this.setState({ userlistModel: res.data }));
  }

  listUserName() {
    var result = (
      <div className="list-style">
        {this.state.userlistModel.map(elem => (
          <ListItem key={elem._id}>
            <Link to={"/users/" + elem._id}>
              <ListItemText>
                {elem.first_name} {elem.last_name}
              </ListItemText>
            </Link>
          </ListItem>
        ))
        }
      </div>
    );
    return result;
  }



  render() {
    return (
      <List component="nav">
        <Typography variant="h5" align="center">
          User List
        </Typography>
        {this.listUserName()}
      </List>

    );
  }
}

export default UserList;
