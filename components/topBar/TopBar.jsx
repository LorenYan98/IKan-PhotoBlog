import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Dialog
} from '@material-ui/core';
import './TopBar.css';
import { Link } from 'react-router-dom';
import axios from "axios";

/**
 * Define TopBar, a React componment of CS142 project #5
 */

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      testInfo: [],
      dialogOpen: false
    };
    axios.get("http://localhost:3000/test/info")
      .then(response => this.setState({ testInfo: response.data }));
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.url !== this.props.match.url) {
      if (window.location.href.split('/').length >= 6) {
        axios.get('http://localhost:3000/user/' + window.location.href.split('/')[5])
          .then(response => this.setState({ items: response.data }));
      }
    }
  }

  userLogout() {
    axios.post('/admin/logout')
      .then(() => { this.props.changeLogin(false); })
      .catch(err => {
        console.error('Logout error:', err);
      });
  }
  handleUploadButtonClicked = (e) => {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      axios.post('/photos/new', domForm)
        .then((res) => {
          console.log(res.data);
          alert('post new photo successfully');
          this.setState({ dialogOpen: false });

        })
        .catch(err => console.log(`POST ERR: ${err}`));
    }
  };

  uploadButton = () => {
    this.setState({ dialogOpen: true });
  };
  closeButton = () => {
    this.setState({ dialogOpen: false });
  };

  render() {
    var displayType;

    if (window.location.href.split('/')[4] === 'users') {
      displayType = "User details " + this.state.items.first_name;
    } else if (window.location.href.split('/')[4] === 'photos') {
      displayType = "Photo of " + this.state.items.first_name;
    } else {
      displayType = "";
    }

    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          <nav className='navbar'>
            <Typography variant="h5" color="inherit">
              {this.props.isLoggedIn ? 'Welcome ' + this.props.currentUser.first_name : "Peidong Yan's Web Page  "}
            </Typography>

            <Typography variant="h5" color="inherit" id="buttonRight">
              {displayType}
            </Typography>
            <Typography color="inherit"  >
              {'version: ' + this.state.testInfo.__v}
            </Typography>
          </nav>
          {this.props.isLoggedIn && (
            <div>
              <Button variant="contained" onClick={this.uploadButton}>
                Upload Photo
              </Button>
              <Dialog open={this.state.dialogOpen}>
                <form onSubmit={this.handleUploadButtonClicked}>
                  <input type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} />
                  <br></br>
                  <Button color="primary" type="submit"  >
                    Upload
                  </Button>
                  <br></br>
                  <Button color="primary" onClick={this.closeButton} >
                    Close
                  </Button>
                </form>
              </Dialog>
              <span className="favorite">  </span>


              <Button
                color="secondary"
                variant="contained"
                component={Link}
                to="/favorite"
              >
                Favorites
              </Button>
            </div>


          )}

          {this.props.isLoggedIn && (
            <Button
              id='right'
              variant='contained'
              onClick={event => { this.userLogout(event); }}
            >
              Log out
            </Button>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
