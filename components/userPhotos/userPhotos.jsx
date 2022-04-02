import React from 'react';
import ClearIcon from '@material-ui/icons/Clear';
import {
  IconButton
} from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';
import { Link } from "react-router-dom";
import './userPhotos.css';
import axios from "axios";
import UserPhotoComments from './userPhotoComments';
/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      user: undefined,
    };
    axios.post("/user/currentUser")
      .then((res) => {
        this.setState({ user: res.data }, () => console.log());
      }
      ).catch(err => {
        console.log(err);
      });
    this.refreshCard = this.refreshCard.bind(this);

    axios.get("/PhotosOfUser/" + this.props.match.params.userId)
      .then((res) => this.setState({ photos: res.data })
      ).catch(err => {
        console.log(err);
      });

  }

  componentDidMount() {
    this._isMounted = true;
    axios.get("/PhotosOfUser/" + this.props.match.params.userId)
      .then((res) => { if (this._isMounted) { this.setState({ photos: res.data }, () => console.log()); } }
      ).catch(err => {
        console.log(err);
      });
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  handleDeletePhoto(photo_id) {
    axios.delete("/photos/" + photo_id, { user_id: this.state.user._id })
      .then(() => this.refreshCard())
      .catch(err => {
        console.log(err);
      });
  }

  handleDeleteComment(photo_id, comment_id) {
    axios.delete("/comments/" + photo_id + "/" + comment_id)
      .then(() => this.refreshCard())
      .catch(err => {
        console.log(err);
      });
  }
  refreshCard() {
    axios.get("/PhotosOfUser/" + this.props.match.params.userId)
      .then((res) => this.setState({ photos: res.data }, () => console.log())
      ).catch(err => {
        console.log(err);
      });
  }
  userPhotoShown() {
    let itemData = this.state.photos;
    let photo = (
      <div>
        {itemData.map((item) => (

          <div key={item._id} className="root">
            <div className="gallery">
              <div className="image">
                <img src={"../images/" + item.file_name} />
              </div>
            </div>
            <div className="desc">
              <p className="time">Creation Date/Time: {item.date_time}
                {item.user_id === this.state.user._id ?
                  (
                    <IconButton
                      onClick={() => this.handleDeletePhoto(item._id)}>
                      <ClearIcon color="action" />
                    </IconButton>
                  )
                  : null}
              </p>

              {item.comments ? this.userCommentShown(item) : (
                <div>
                  <p className="comment">No Comment</p>
                </div>
              )}

              <UserPhotoComments
                refreshCard={this.refreshCard}
                photo={item}
              />
            </div>
          </div>
        ))}
      </div>
    );
    return photo;
  }
  userCommentShown(item) {
    let g = () => this.state.photos[0].file_name;
    g();
    let commentList =
      (
        <div className="box">
          {item.comments.map((comm) => (
            <div key={comm._id}>
              <div className="root" >
                <p>
                  <Link to={"/users/" + comm.user._id} className="userName">
                    {comm.user.first_name} {comm.user.last_name}
                  </Link>
                  <span> written: </span>
                </p>

                <p className="comment">
                  {comm.comment}
                </p>
                <p className="time">
                  {comm.date_time}
                </p>
              </div>
              {comm.user._id === this.state.user._id ?
                (
                  <p>
                    <IconButton onClick={() => this.handleDeleteComment(item._id, comm._id)}>
                      <DeleteIcon color="action" />
                    </IconButton>
                    Delete {comm.user.first_name}&apos;s comment
                  </p>
                )
                : null}
            </div>
          ))
          }
        </div>
      );
    return commentList;
  }

  render() {
    return (
      <div className="container">
        {this.userPhotoShown()}
      </div>
    );
  }
}

export default UserPhotos;
