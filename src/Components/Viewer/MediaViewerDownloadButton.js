import React from 'react';
import PropTypes from 'prop-types';
import SaveIcon from '@material-ui/icons/GetApp';
import MediaViewerFooterButton from './MediaViewerFooterButton';
import FileStore from '../../Stores/FileStore';
import './MediaViewerFooterButton.css';

const iconStyle = {
    padding: 20,
    color: 'white'
};

class MediaViewerDownloadButton extends React.Component {
    constructor(props) {
        super(props);

        const { fileId } = props;

        this.state = {
            prevPropsFileId: fileId,
            fileId: fileId,
            disabled: MediaViewerDownloadButton.saveDisabled(fileId)
        };
    }

    static getDerivedStateFromProps(props, state) {
        const { fileId } = props;
        const { prevPropsFileId } = state;

        if (fileId !== prevPropsFileId) {
            return {
                prevPropsFileId: fileId,
                fileId: fileId,
                disabled: MediaViewerDownloadButton.saveDisabled(fileId)
            };
        }

        return null;
    }

    componentDidMount() {
        FileStore.on('clientUpdateAnimationBlob', this.onClientUpdateMediaBlob);
        FileStore.on('clientUpdateChatBlob', this.onClientUpdateMediaBlob);
        FileStore.on('clientUpdateDocumentBlob', this.onClientUpdateMediaBlob);
        FileStore.on('clientUpdatePhotoBlob', this.onClientUpdateMediaBlob);
        FileStore.on('clientUpdateUserBlob', this.onClientUpdateMediaBlob);
        FileStore.on('clientUpdateVideoBlob', this.onClientUpdateMediaBlob);
    }

    componentWillUnmount() {
        FileStore.off('clientUpdateAnimationBlob', this.onClientUpdateMediaBlob);
        FileStore.off('clientUpdateChatBlob', this.onClientUpdateMediaBlob);
        FileStore.off('clientUpdateDocumentBlob', this.onClientUpdateMediaBlob);
        FileStore.off('clientUpdatePhotoBlob', this.onClientUpdateMediaBlob);
        FileStore.off('clientUpdateUserBlob', this.onClientUpdateMediaBlob);
        FileStore.off('clientUpdateVideoBlob', this.onClientUpdateMediaBlob);
    }

    onClientUpdateMediaBlob = update => {
        const { fileId } = this.state;

        if (fileId === update.fileId) {
            this.setState({
                disabled: MediaViewerDownloadButton.saveDisabled(fileId)
            });
        }
    };

    static saveDisabled = fileId => {
        return !Boolean(FileStore.getBlob(fileId));
    };

    handleClick = event => {
        event.stopPropagation();

        const { onClick } = this.props;
        const { disabled } = this.state;
        if (disabled) return;

        onClick(event);
    };

    render() {
        const { title, children } = this.props;
        const { disabled } = this.state;

        return (
            <MediaViewerFooterButton disabled={disabled} title={title} onClick={this.handleClick}>
                {children || <SaveIcon style={iconStyle} />}
            </MediaViewerFooterButton>
        );
    }
}

MediaViewerDownloadButton.propTypes = {
    fileId: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string
};

export default MediaViewerDownloadButton;
