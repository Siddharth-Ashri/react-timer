class TimersDashboard extends React.Component {
  state = {
    timers: []
  };
  componentDidMount() {
    this.loadTimersFromServer();
    setInterval(this.loadTimersFromServer, 5000);
  }
  loadTimersFromServer = () => {
    client.getTimers(serverTimers => {
      this.setState({ timers: serverTimers });
    });
  };
  handleCreateFormSubmit = timer => {
    this.createTimer(timer);
  };

  handleEditFormSubmit = attrs => {
    this.updateTimer(attrs);
  };
  handleDelete = attrs => {
    this.deleteTimer(attrs);
  };
  deleteTimer = attrs => {
    console.log("TIMER DELETED");
    this.setState({
      timers: this.state.timers.filter(timer => {
        console.log(attrs.id);
        if (timer.id !== attrs.id) {
          return timer;
        }
      })
    });
    client.deleteTimer({ id: attrs.id });
  };
  createTimer = timer => {
    const t = helpers.newTimer(timer);
    this.setState({ timers: this.state.timers.concat(t) });
    client.createTimer(timer);
  };

  updateTimer = attrs => {
    this.setState({
      timers: this.state.timers.map(timer => {
        if (timer.id === attrs.id) {
          return Object.assign({}, timer, {
            title: attrs.title,
            project: attrs.project
          });
        } else {
          return timer;
        }
      })
    });
    client.updateTimer(attrs);
  };
  handleStartClick = timerId => {
    this.startTimer(timerId);
  };
  handleStopClick = timerId => {
    this.stopTimer(timerId);
  };
  //has two components one handles all the timers in the list(i.e. EditableTimerList)
  // The other one is the ToggleableTimerForm which is either the plus icon or the new timer form which adds a timer to the Editable timer list
  startTimer = timerId => {
    const now = Date.now();
    console.log(now);
    this.setState({
      timers: this.state.timers.map(timer => {
        if (timer.id === timerId) {
          return Object.assign({}, timer, {
            runningSince: now
          });
        } else {
          return timer;
        }
      })
    });
    client.startTimer({ id: timerId, start: now });
  };

  stopTimer = timerId => {
    const now = Date.now();
    this.setState({
      timers: this.state.timers.map(timer => {
        if (timer.id === timerId) {
          const lastElapsed= now - timer.runningSince
          return Object.assign({}, timer, {
            elapsed: timer.elapsed + lastElapsed,
            runningSince: null
          });
        } else {
          return timer;
        }
      })
    });
    client.stopTimer({ id: timerId, stop: now });
  };
  render() {
    return (
      <div className="ui three column centered grid">
        <div className="column">
          <EditableTimerList
            timers={this.state.timers}
            onDeleteClick={this.handleDelete}
            onStartClick={this.handleStartClick}
            onStopClick={this.handleStopClick}
            onFormSubmit={this.handleEditFormSubmit}
          />
          <ToggleableTimerForm
            onFormSubmit={this.handleCreateFormSubmit}
            isOpen={true}
          />
        </div>
      </div>
    );
  }
}
class EditableTimerList extends React.Component {
  render() {
    const timers = this.props.timers.map(timer => (
      <EditableTimer
        onFormSubmit={this.props.onFormSubmit}
        key={timer.id}
        onDeleteClick={this.props.onDeleteClick}
        id={timer.id}
        title={timer.title}
        project={timer.project}
        elapsed={timer.elapsed}
        runningSince={timer.runningSince}
        onStartClick={this.props.onStartClick}
        onStopClick={this.props.onStopClick}
      />
    ));
    return <div id="timers">{timers}</div>;
  }
}
class EditableTimer extends React.Component {
  state = {
    editFormOpen: false
  };
  handleEditClick = () => {
    this.openForm();
  };
  handleTrash = () => {
    this.props.onDeleteClick({ id: this.props.id });
  };
  handleFormClose = () => {
    this.closeForm();
  };
  handleFormSubmit = timer => {
    this.props.onFormSubmit(timer);
    this.closeForm();
  };
  closeForm = () => {
    this.setState({ editFormOpen: false });
  };
  openForm = () => {
    this.setState({ editFormOpen: true });
  };
  render() {
    if (this.state.editFormOpen) {
      return (
        <TimerForm
          id={this.props.id}
          onFormSubmit={this.handleFormSubmit}
          onFormClose={this.handleFormClose}
          title={this.props.title}
          project={this.props.project}
        />
      );
    } else {
      return (
        <Timer
          id={this.props.id}
          title={this.props.title}
          onFormEdit={this.handleOnEdit}
          onTrashClick={this.handleTrash}
          onEditClick={this.handleEditClick}
          project={this.props.project}
          elapsed={this.props.elapsed}
          runningSince={this.props.runningSince}
          onStartClick={this.props.onStartClick}
          onStopClick={this.props.onStopClick}
        />
      );
    }
  }
}
class TimerForm extends React.Component {
  state = {
    title: this.props.title || "",
    project: this.props.project || ""
  };
  handleTitleChange = e => {
    this.setState({ title: e.target.value });
  };
  handleProjectChange = e => {
    this.setState({ project: e.target.value });
  };
  handleSubmit = () => {
    this.props.onFormSubmit({
      id: this.props.id,
      title: this.state.title,
      project: this.state.project
    });
  };
  render() {
    const submitText = this.props.id ? "Update" : "Create";
    return (
      <div className="ui centered card">
        <div className="content">
          <div className="ui form">
            <div className="field">
              <label>Title</label>
              <input
                type="text"
                value={this.state.title}
                onChange={this.handleTitleChange}
              />
            </div>
            <div className="field">
              <label>Project</label>
              <input
                type="text"
                value={this.state.project}
                onChange={this.handleProjectChange}
              />
            </div>
            <div className="ui two bottom attached buttons">
              <button
                onClick={this.handleSubmit}
                className="ui basic blue button"
              >
                {submitText}
              </button>
              <button
                onClick={this.props.onFormClose}
                className="ui basic red button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
class ToggleableTimerForm extends React.Component {
  state = {
    isOpen: false
  };
  handleFormOpen = () => {
    this.setState({ isOpen: true });
  };
  handleFormClose = () => {
    this.setState({ isOpen: false });
  };
  handleFormSubmit = timer => {
    this.props.onFormSubmit(timer);
    this.setState({ isOpen: false });
  };
  render() {
    if (this.state.isOpen) {
      return (
        <TimerForm
          onFormClose={this.handleFormClose}
          onFormSubmit={this.handleFormSubmit}
        />
      );
    } else {
      return (
        <div className="ui basic content center aligned segment">
          <button
            className="ui basic button icon"
            onClick={this.handleFormOpen}
          >
            <i className="plus icon" />
          </button>
        </div>
      );
    }
  }
}
class Timer extends React.Component {
  componentDidMount() {
    this.forceUpdateInterval = setInterval(() => this.forceUpdate(), 50);
  }
  handleStartClick = () => {
    this.props.onStartClick(this.props.id);
  };
  handleStopClick = () => {
    this.props.onStopClick(this.props.id);
  };
  componentWillUnmount() {
    clearInterval(this.forceUpdateInterval);
  }

  render() {
    const elapsedString = helpers.renderElapsedString(
      this.props.elapsed,
      this.props.runningSince
    );
    return (
      <div className="ui centered card">
        <div className="content">
          <div className="header">{this.props.title}</div>
          <div className="meta">{this.props.project}</div>
          <div className="center aligned description">
            <h2>{elapsedString}</h2>
          </div>
          <div className="extra content">
            <span
              onClick={this.props.onEditClick}
              className="right floated edit icon"
            >
              <i className="edit icon" />
            </span>
            <span
              onClick={this.props.onTrashClick}
              className="right floated trash icon"
            >
              <i className="trash icon" />
            </span>
          </div>
        </div>
        <TimerActionButton
          timerIsRunning={!!this.props.runningSince}
          onStartClick={this.handleStartClick}
          onStopClick={this.handleStopClick}
        />
      </div>
    );
  }
}
class TimerActionButton extends React.Component {
  render() {
    if (this.props.timerIsRunning) {
      return (
        <div
          className="ui bottom attached red basic button"
          onClick={this.props.onStopClick}
        >
          Stop
        </div>
      );
    } else {
      return (
        <div
          className="ui bottom attached blue basic button"
          onClick={this.props.onStartClick}
        >
          Start
        </div>
      );
    }
  }
}
ReactDOM.render(<TimersDashboard />, document.getElementById("content"));
