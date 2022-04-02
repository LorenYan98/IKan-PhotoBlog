import React from 'react';

import { Typography, Grid, Divider, Dialog, Button } from '@material-ui/core';
import axios from "axios";
import { Clear } from "@material-ui/icons";
import './Favorite.css';
class Favorite extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            favorite_list: [],
            dialogOpen: false,
            fileName: ""
        };
        this.getFavorite = this.getFavorite.bind(this);
        this.userPhotoShown = this.userPhotoShown.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.uploadButton = this.uploadButton.bind(this);
        this.getFavorite();

    }
    componentDidMount() {
        this.getFavorite();
    }
    handleDelete(item) {
        axios.delete('/favorite/' + item.id, { photo_id: item._id })
            .then(() => {
                // console.log("deleted successfully");
                // this.setState({ modelOpen: false });
                this.getFavorite();
            })
            .catch(err => {
                console.log(err.response.data);
            });
    }

    uploadButton = (file_name) => {
        // console.log(file_name);
        this.setState({ fileName: file_name, dialogOpen: true }, () => console.log(this.state));
    };
    closeButton = () => {
        this.setState({ dialogOpen: false });
    };

    getFavorite = () => {
        axios.get('/favorite')
            .then((response) => {
                this.setState({ favorite_list: response.data });
            }).catch(err => console.log(err));
    };

    userPhotoShown() {
        let itemData = this.state.favorite_list;

        let photo = (
            <div>
                {itemData.map((item) => (
                    <div key={item._id} className="root">
                        <div role="button" className="gallery" onClick={() => this.uploadButton(item.file_name)}>
                            <div className="image">
                                <img src={"../images/" + item.file_name} />

                            </div>
                        </div>
                        <Dialog open={this.state.dialogOpen && this.state.fileName === item.file_name}
                            aria-labelledby="customized-dialog-title">
                            <div className="gallery">
                                <div className="image">
                                    <img src={`../images/${item.file_name}`} />
                                    {/* {console.log(this.state.fileName)} */}
                                </div>
                            </div>
                            <p className="time">Creation Date/Time: {item.date_time}</p>
                            <br></br>

                            <Button color="primary" onClick={this.closeButton} >
                                Close
                            </Button>

                        </Dialog>

                        <div className="flex-box">

                            <p className="time">Creation Date/Time: {item.date_time}</p>
                            <button className='flex-box-2' onClick={() => this.handleDelete(item)}><Clear></Clear></button>
                        </div>
                    </div>
                )
                )}

            </div>
        );
        return photo;
    }

    render() {
        return (
            <Grid container >
                <Grid item xs={12}>
                    <Typography variant="h3">My favorite photos</Typography>
                    <br />
                    <Divider />
                    <br />
                </Grid>
                {this.userPhotoShown()}
            </Grid>
        );
    }
}

export default Favorite;