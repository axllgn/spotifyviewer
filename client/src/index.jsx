//React
import React from 'react';
import ReactDOM from 'react-dom';
import {Button, ButtonGroup} from 'react-bootstrap'
import Player from 'react-youtube';

//jQuery
import $ from 'jquery';

//Components
import List from './components/List.jsx'
import ReturnLink from './components/ReturnLink.jsx'
import Search from './components/Search.jsx'

var port = process.env.PORT || 3000;

class App extends React.Component {
  //Required
  constructor(props) {
    super(props);
    this.state = { 
      items: [],
      currentVideoID :'',
      searchText: '',
      currentUser: '',
      currentPlaylist: '',
      location: location.href
    }
    this.playNext = this.playNext.bind(this);
    this.stopVideo = this.stopVideo.bind(this);
    this.onReady = this.onReady.bind(this);
    this.playPauseVideo = this.playPauseVideo.bind(this);
  }

  //On-start
  componentDidMount() {
    this.state.location = this.state.location.split('?')[1]
    console.log(this.state.location, 'location')
    if(!this.state.location){
      this.getVideoDB() 
    } else {
      var linkQ = this.state.location.split(':')
      console.log('linkQ': linkQ)
      this.getVideo([linkQ[0], linkQ[1]])
    }
  }
  
  //Ajax Requests
  getVideoDB(){
    $.get({
      url: '/playlistdb', 
      success: (data) => {
        this.setState({items:data})
        this.setState({currentVideoID:data[0].videoUrl})
      },
      error: (err) => {
        console.log('err', err);
      }
    });
  }

  getVideo(playlistUriUrl){
    if(playlistUriUrl.indexOf('spotify') === 0){
      var spotifyUri = playlistUriUrl.split(':')
      var spotifyUserPlaylist = [spotifyUri[2], spotifyUri[4]]
    } else if(playlistUriUrl.indexOf('https://') === 0){
      var spotifyUrl= playlistUriUrl.split('/')
      var spotifyUserPlaylist = [spotifyUrl[4], spotifyUrl[6]]
    } else {
      var spotifyUserPlaylist=[playlistUriUrl[0], playlistUriUrl[1]]
    }

    $.get({
      url: '/playlist', 
      data: {
        user: spotifyUserPlaylist[0],
        playlist: spotifyUserPlaylist[1]
      },
      success: (data) => {
        var data = JSON.parse(data)
        console.log(typeof data, data)
        this.setState({
          items: data,
          currentUser: data[0].playlistOwner,
          currentPlaylist: data[0].playlistId
        })
        this.setState({currentVideoID:data[0].videoUrl})
      },
      error: (err) => {
        console.log('err', err);
      }
    });
  }

  updateLastPlayed(songObj){
    console.log(true)
    $.post({
      url: '/updatelastplayed', 
      data: songObj,
      success: (data) => {
        console.log('Updated Last Played')
      },
      error: (err) => {
        console.log('err', err);
      }
    });
  }

  //Player Functions
  clickSong(songObj){
    this.setState({currentVideoID: songObj.videoUrl})
    this.updateLastPlayed(songObj);
  }

  playPauseVideo(){
    var playerState = this.state.player.getPlayerState();
    if(playerState === 2 || playerState === 5){
      this.state.player.playVideo();
    } else if(playerState === 1){
      this.state.player.pauseVideo();
    } else if(playerState === 0){
      this.playNext();
    }
  }

  handleKeyPress(e){console.log(e)}

  toggleMute(){
    console.log(true)
    var muted = window.player.isMuted();
    console.log(muted)
    if(!muted){
      player.window.unMute()
    } else {
      player.window.mute()
    }
  }

  playNext(videoIndex){
    var index = Math.floor(Math.random(this.state.items.length)*this.state.items.length)
    console.log('videoIndex', index)
    console.log(this.state.items)
    this.setState({currentVideoID: this.state.items[index].videoUrl})
  }

  stopVideo(){
    this.state.player.stopVideo();
  }
  
  onReady(event){
    this.setState({
      player : event.target
    })
  }

  render () {
    var hasPlaylist = !!this.currentUser
    var opts = {
      height:'390',
      width:'640',
      playerVars:{
        autoplay: 1,
        enablejsapi: 1,
        fs: 1,
        iv_load_policy: 3
      }
    }
    return (
      <div onKeyDown={console.log('hello')} >
        <h1>Spotify Viewer</h1>
        <Search 
        getVideos={this.getVideo.bind(this)}
        />
        <ReturnLink player={this.state} />
        <Player 
        opts = {opts}
        id="player"
        videoId={this.state.currentVideoID}
        onEnd={this.playNext}
        onReady={this.onReady}
        />
        <div>
          <ButtonGroup>
            <Button  onClick={this.playPauseVideo}>Play/Pause</Button>{' '}
            <Button  bsStyle="success" onClick={this.playNext}>Next</Button>{' '}
            <Button  bsStyle="danger" onClick={this.stopVideo}>Stop</Button>{' '}
          </ButtonGroup>
        </div>
        <List 
        items = {this.state.items} 
        clickSong = {this.clickSong.bind(this)}
        />
      </div>)
  }
}

ReactDOM.render(<App />, document.getElementById('app'));

  // previous(){

  // }


// //
//           <Button outline color="primary">Previous</Button>{' '}
//           <Button outline color="info" onclick={this.toggleMute}>Shuffle</Button>{' '}
//           <Button outline color="link" onclick={this.toggleMute}>Mute</Button>{' '}