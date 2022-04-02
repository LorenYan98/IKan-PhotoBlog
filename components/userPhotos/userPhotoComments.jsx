import React from "react";
import {
    Input, Button, IconButton
} from "@material-ui/core";
import StarsIcon from '@material-ui/icons/Stars';
const axios = require("axios");


class UserPhotoComments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comment: "",
            favor: false,
        };

    }

    addComment(event, photo_id) {
        event.preventDefault();
        axios.post('/commentsOfPhoto/' + photo_id, { comment: this.state.comment })
            .then(() => {
                this.setState({ comment: "" });
                this.props.refreshCard();
            }).catch(err => console.log(err));
    }
    updateChange(event) {
        this.setState({ comment: event.target.value });
    }

    handleFavoriteClick() {
        let photo_id = this.props.photo._id;
        if (this.state.favor) {
            axios.delete('/favorite/' + photo_id, { photo_id: this.props.photo._id })
                .then(this.setState({ favor: false }))
                .catch(err => {
                    console.log(err.response.data);
                });
        } else {
            axios.post('/favorite/' + photo_id, { photo_id: this.props.photo._id })
                .then(this.setState({ favor: true }))
                .catch(err => {
                    console.log(err.response.data);
                });
        }
    }



    render() {
        return (
            <div>
                <form id="commentForm" onSubmit={(event) => this.addComment(event, this.props.photo._id)}>
                    <label id="commentlabel" htmlFor="commentInput">Comment:{" "}    </label>
                    <Input
                        id="commentInput"
                        required
                        color="primary"
                        type="text"
                        value={this.state.comment}
                        onChange={(event) => { this.updateChange(event); }}
                    />

                    <span id="commentspan">   </span>
                    <Button id="commentSubmit" variant="outlined" color="primary" type="submit" value="submit">
                        Submit
                    </Button>

                </form>
                {this.state.favor === false ?
                    (
                        <IconButton
                            onClick={event => this.handleFavoriteClick(event)}>
                            <StarsIcon color="action" />
                        </IconButton>
                    ) :
                    (
                        <IconButton
                            onClick={event => this.handleFavoriteClick(event)}>
                            <StarsIcon color="secondary" />
                        </IconButton>
                    )
                }

            </div>
        );
    }

}
export default UserPhotoComments;