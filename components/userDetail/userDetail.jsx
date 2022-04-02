import React from 'react';
import { Link } from "react-router-dom";
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Button,
  Typography,
  Dialog,
  DialogContent,
  DialogContentText,
  ListItem,
  Avatar,
  ListItemText
} from '@material-ui/core';

import './userDetail.css';
import axios from "axios";

/**
 * Define UserDetail, a React componment of CS142 project #5
 */

class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.match.params.userId,
      userInfo: [],
      curUser: "",
      dialogOpen: false,
      photos: undefined,
      maxCommentPhotoName: undefined,
      newestPhotoName: undefined
    };
    this.findPhotofileName = this.findPhotofileName.bind(this);
    axios.post("/user/currentUser")
      .then((res) => {
        this.setState({ curUser: res.data }, () => console.log());
      }
      ).catch(err => {
        console.log(err);
      });
    axios.get("user/" + this.state.user)
      .then((res) => this.setState({ userInfo: res.data }, () => { }))
      .catch(err => {
        console.log(err);
      });
    axios.get("/PhotosOfUser/" + this.props.match.params.userId)
      .then((res) => {
        this.setState({ photos: res.data }, () => { });
        this.findPhotofileName();
      }
      ).catch(err => {
        console.log(err);
      });

  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      // this.setState({ user: this.props.match.params.userId })
      axios.get("user/" + this.props.match.params.userId)
        .then((res) => {
          this.setState({ userInfo: res.data }, () => { });
          axios.get("/PhotosOfUser/" + this.state.userInfo._id)
            .then((result) => {
              this.setState({ photos: result.data }, () => { });
              this.findPhotofileName();
            }
            ).catch(err => {
              console.log(err);
            });
        }
        );

    }
  }

  findPhotofileName() {
    if (!this.state.photos) return;
    let photos = this.state.photos;
    let maxCount = -1;
    let maxCommentPhotoName = "";
    for (let i = 0; i < photos.length; i++) {
      if (photos[i].comments.length > maxCount) {
        maxCount = photos[i].comments.length;
        maxCommentPhotoName = photos[i].file_name;
      }
    }

    this.setState({ maxCommentPhotoName: maxCommentPhotoName }, () => { });
    const newestPhotoName = photos.sort((a, b) => b.date_time - a.date_time)[photos.length - 1].file_name;
    this.setState({ newestPhotoName: newestPhotoName }, () => { });
    // console.log(this.state.maxCommentPhotoName + " and " + this.state.newestPhotoName);
  }
  openButton() {
    // console.log(file_name);
    this.setState({ dialogOpen: true });
  }
  closeButton() {
    this.setState({ dialogOpen: false });
  }
  userLogout() {
    axios.post('/admin/logout')
      .then(() => { this.props.changeLogin(false); })
      .catch(err => {
        console.error('Logout error:', err);
      });
  }
  handleDeleteAccount() {
    axios.delete("/user/" + this.state.curUser._id)
      .then(() => {
        this.userLogout();
        localStorage.clear();
      });
  }

  listUserInfo() {
    let userDetail = this.state.userInfo;
    let result = (
      < div >
        <Card className="card">
          <CardActionArea >

            <CardContent>
              <Typography gutterBottom variant="h5" component="h2" className="list">
                {userDetail.first_name} {userDetail.last_name}
              </Typography>
              <Typography gutterBottom variant="body1" component="h5" className="list">
                <p>Location: {userDetail.location}</p>
                <p>Occupation: {userDetail.occupation}</p>
              </Typography>
              <Typography variant="body1" color="textSecondary" component="p">
                {userDetail.description}
              </Typography>

            </CardContent>
            <ListItem>

              <Link to={"/photos/" + this.state.userInfo._id}>
                <Avatar style={{ height: '100px', width: '100px' }}>
                  {this.state.newestPhotoName ? (
                    <Avatar style={{ height: '100px', width: '100px' }} src={"../images/" + this.state.newestPhotoName} />
                  ) : null}
                </Avatar>
              </Link>

              <ListItemText primary="Recent uploaded photo" />
            </ListItem>
            <ListItem>

              <Link to={"/photos/" + this.state.userInfo._id}>
                <Avatar style={{ height: '100px', width: '100px' }}>
                  {this.state.maxCommentPhotoName ? (
                    <Avatar style={{ height: '100px', width: '100px' }} src={"../images/" + this.state.maxCommentPhotoName} />
                  ) : null}
                </Avatar>
              </Link>

              <ListItemText primary="Photo with the most comments" />
            </ListItem>

          </CardActionArea>

          <CardActions>
            <Link to={"/photos/" + this.state.userInfo._id}>
              <Button variant="contained" color="primary" className="button">
                Click for pictures
              </Button>
            </Link>
            {this.state.curUser._id === this.props.match.params.userId ?
              (
                <Button variant="outlined" onClick={(event) => this.openButton(event)} color="secondary" className="button">
                  Delete Account
                </Button>
              ) : null}

          </CardActions>
        </Card >
      </div >
    );
    return result;
  }



  render() {
    return (
      <div id="box">
        {this.listUserInfo()}
        <Dialog open={this.state.dialogOpen}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description">

          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Please confirm that you want to delete your account, [
              {this.state.curUser.first_name} {this.state.curUser.last_name}]
            </DialogContentText>
            <Button variant='contained' color="secondary" onClick={(event) => this.handleDeleteAccount(event)} >
              Delete
            </Button>
            <Button color="primary" onClick={(event) => this.closeButton(event)} >
              Cancel
            </Button>
          </DialogContent>


        </Dialog>
      </div>
    );
  }
}

export default UserDetail;
