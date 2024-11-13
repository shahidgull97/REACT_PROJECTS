import React, { Component, createRef } from "react";

import styles from "./style.module.css";
import classNames from "classnames";

class IPodInterface extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showMenu: true,
      selectedIndex: 0,
      isScrolling: false,
      lastAngle: 0,
      currentMenu: "main", // Track current menu level
      menuHistory: [], // Track menu navigation history
      currentlyPlaying: null,
    };

    // Define menu structure
    this.menuStructure = {
      main: [
        { id: "coverFlow", name: "Cover Flow", icon: "🎵" },
        { id: "music", name: "Music", icon: "🎵", hasSubmenu: true },
        { id: "games", name: "Games", icon: "🎮" },
        { id: "settings", name: "Settings", icon: "⚙️" },
      ],
      music: [
        { id: "playlists", name: "Playlists", icon: "📋", hasSubmenu: true },
        { id: "artists", name: "Artists", icon: "🎤", hasSubmenu: true },
        { id: "albums", name: "Albums", icon: "💿", hasSubmenu: true },
        { id: "songs", name: "Songs", icon: "🎵", hasSubmenu: true },
      ],
      playlists: [
        { id: "playlist1", name: "Favorites", icon: "⭐" },
        { id: "playlist2", name: "Recently Added", icon: "🆕" },
        { id: "playlist3", name: "Top 25", icon: "🔥" },
      ],
      artists: [
        { id: "artist1", name: "The Beatles", icon: "👥" },
        { id: "artist2", name: "Queen", icon: "👥" },
        { id: "artist3", name: "Pink Floyd", icon: "👥" },
      ],
      albums: [
        { id: "album1", name: "Abbey Road", icon: "💿" },
        { id: "album2", name: "The Dark Side of the Moon", icon: "💿" },
        { id: "album3", name: "A Night at the Opera", icon: "💿" },
      ],
      songs: [
        {
          id: "song1",
          name: "Hey Jude",
          artist: "The Beatles",
          icon: "🎵",
        },
        { id: "song2", name: "Bohemian Rhapsody", artist: "Queen", icon: "🎵" },
        { id: "song3", name: "Money", artist: "Pink Floyd", icon: "🎵" },
      ],
    };

    this.wheelRef = createRef();
    this.centerRef = createRef();
    // Bind methods
    this.calculateAngle = this.calculateAngle.bind(this);
    this.handleWheelMove = this.handleWheelMove.bind(this);
    this.handleCenterMouseDown = this.handleCenterMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleCenterClick = this.handleCenterClick.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mouseup", this.handleMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener("mouseup", this.handleMouseUp);
  }

  // This function calculates the angel based on location of current pointer and the cdenter of wheelRef
  calculateAngle(event) {
    const wheel = this.wheelRef.current;
    const rect = wheel.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    return (
      Math.atan2(event.clientY - centerY, event.clientX - centerX) *
      (180 / Math.PI)
    );
  }

  // This is to track the movement of your cursor
  handleWheelMove(event) {
    if (!this.state.isScrolling) return;

    const currentAngle = this.calculateAngle(event);
    const angleDiff = currentAngle - this.state.lastAngle;

    // Determine scroll direction based on angle difference
    if (Math.abs(angleDiff) > 5) {
      // Threshold to prevent tiny movements
      this.setState((prevState) => ({
        selectedIndex:
          angleDiff > 0
            ? (prevState.selectedIndex + 1) % this.menuStructure.main.length
            : (prevState.selectedIndex - 1 + this.menuStructure.main.length) %
              this.menuStructure.main.length,
        lastAngle: currentAngle,
      }));
    }
  }

  // This function gives you the angle after you click the center button and move
  handleCenterMouseDown(event) {
    this.setState({
      isScrolling: true,
      lastAngle: this.calculateAngle(event),
    });
    event.preventDefault();
  }

  handleMouseUp() {
    this.setState({ isScrolling: false });
  }
  // This will give you current menu items
  getCurrentMenuItems() {
    return this.menuStructure[this.state.currentMenu] || [];
  }

  // This is the center click functionality
  handleCenterClick = () => {
    const currentItems = this.getCurrentMenuItems();
    const selectedItem = currentItems[this.state.selectedIndex];
    console.log(currentItems, selectedItem);
    console.log(this.state.showMenu);
    console.log(this.state.menuHistory);

    if (!this.state.showMenu) {
      // If in content view, go back to menu
      this.setState({ showMenu: true });
    } else if (selectedItem) {
      if (selectedItem.hasSubmenu) {
        // Navigate to submenu if there are any otherwise the else part will be executed and you will see somehting else on screen other than menu
        this.setState((prevState) => ({
          currentMenu: selectedItem.id,
          menuHistory: [...prevState.menuHistory, prevState.currentMenu],
          selectedIndex: 0,
        }));
      } else {
        // Handle item selection (e.g., play song, show album)
        this.setState({
          showMenu: false,
          currentlyPlaying: selectedItem,
        });
      }
    }
  };

  handleMenuButton = () => {
    if (this.state.menuHistory.length > 0) {
      // Go back to previous menu
      this.setState((prevState) => ({
        // This will get the current menu you are at
        currentMenu: prevState.menuHistory[prevState.menuHistory.length - 1],
        // This will remove the last menu in the menu array
        menuHistory: prevState.menuHistory.slice(0, -1),
        // This will set the index for the new menu
        selectedIndex: 0,
        showMenu: true,
      }));
    }
  };

  renderContent() {
    const { currentlyPlaying, currentMenu } = this.state;
    console.log(currentlyPlaying.audio);
    if (!currentlyPlaying) return null;

    return (
      <div>
        <div className={styles.albumArt}>
          {currentlyPlaying.icon} {/* Replace with actual album art */}
        </div>
        <div className={styles.nowPlaying}>
          <div>
            <strong>{currentlyPlaying.name}</strong>
          </div>
          {currentlyPlaying.artist && <div>{currentlyPlaying.artist}</div>}
        </div>
      </div>
    );
  }

  render() {
    const { showMenu, selectedIndex, currentMenu } = this.state;
    const currentItems = this.getCurrentMenuItems();

    return (
      <div className={styles.container}>
        <div className={styles.ipod}>
          <div className={styles.screen}>
            {/* Condition to check if the menu should be shown or not */}
            {showMenu ? (
              <div>
                <div className={styles.menuHeader}>
                  {/* This is to show at the top in which menu you are default is iPod.js */}
                  {currentMenu === "main" ? "iPod.js" : currentMenu}
                </div>
                {/* This displays the items of the menu you are in */}
                {currentItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={classNames(styles.menuItem, {
                      [styles.selectedMenuItem]: index === selectedIndex,
                    })}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                    {item.artist && ` - ${item.artist}`}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.contentView}>{this.renderContent()}</div>
            )}
          </div>
          {/* This is the disc div on which you move the cursor with its ref */}
          <div
            ref={this.wheelRef}
            className={styles.clickWheel}
            onMouseMove={this.handleWheelMove}
          >
            {/* This is the center button with which you navigate */}
            <button
              ref={this.centerRef}
              className={styles.centerButton}
              onMouseDown={this.handleCenterMouseDown}
              onClick={this.handleCenterClick}
            />
            {/* This is a menu button */}
            <button
              className={styles.menuText}
              style={{ border: "none", background: "white" }}
              onClick={this.handleMenuButton}
            >
              MENU
            </button>
            <div className={styles.controls}>
              <div
                className={styles.menuText}
                style={{ top: "auto", bottom: "16px" }}
              >
                ⏯️
              </div>
              <div
                className={styles.menuText}
                style={{
                  left: "16px",
                  transform: "translateY(-50%)",
                  top: "50%",
                }}
              >
                ⏮️
              </div>
              <div
                className={styles.menuText}
                style={{
                  left: "auto",
                  right: "16px",
                  transform: "translateY(-50%)",
                  top: "50%",
                }}
              >
                ⏭️
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default IPodInterface;
