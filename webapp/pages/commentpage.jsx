var React = require('react')
var Link = require('react-router').Link
var Icon = require('icon.jsx')
var UserID = require('userID.jsx')
var GetIPFS = require('getipfs.jsx')
var Comment = require('comment.jsx').Comment

module.exports = function (boardsAPI) {
  return React.createClass({
    getInitialState: function () {
      return { parent: false, api: false }
    },
    componentDidMount: function () {
      boardsAPI.use(boards => {
        boards.getEventEmitter().on('init', (err, limited) => {
          if ((!err || limited) && this.isMounted()) {
            this.init(boards)
          }
        })
        if (boards.isInit || boards.limited) {
          this.init(boards)
        }
      })
    },
    componentWillReceiveProps: function (nextProps) {
      if (this.props.params !== nextProps.params) {
        boardsAPI.use(boards => this.init(boards, nextProps))
      }
    },
    downloadComment: function (boards, props) {
      boards.downloadComment(props.params.commenthash, props.params.userid, props.params.boardname, (err, comment) => {
        if (err) {
          this.setState({
            comment: { title: 'Error', text: err.Message || err.Error }
          })
        } else {
          if (!comment.parent && comment.text) {
            // Redirect to post page
            this.props.history.push('/@' + this.props.params.userid + '/' + this.props.params.boardname + '/' + this.props.params.commenthash)
          } else {
            this.setState({ comment })
          }
        }
      })
    },
    init: function (boards, props) {
      this.setState({ comment: false, boards, api: true, allowReply: boards.isInit && !boards.limited })
      this.downloadComment(boards, props || this.props)
    },
    getContext: function () {
      if (this.props.params.userid) {
        if (this.props.params.boardname) {
          return <div>Comment by <UserID id={this.props.params.userid} api={this.state.boards} /> in <Link to={'@' + this.props.params.userid + '/' + this.props.params.boardname}>#{this.props.params.boardname}</Link> to <Link to={'/@' + this.props.params.userid + '/' + this.props.params.boardname + '/' + this.props.params.posthash }>{this.props.params.posthash}</Link></div>
        } else {
          return <div>Comment by <UserID id={this.props.params.userid} api={this.state.boards} /></div>
        }
      } else return <div><h6 className='light'>You are viewing a single comment</h6></div>
    },
    showComment: function () {
      if (this.state.comment) {
        console.log('allowReply', this.state.allowReply)
        return <Comment allowReply={this.state.allowReply} comment={this.state.comment} post={this.props.params.posthash} adminID={this.props.params.userid} board={this.props.params.boardname} showParent={true} api={this.state.boards} />
      } else {
        return <div className='center-block text-center find-content'>
          <Icon name='refresh' className='fa-3x center-block light fa-spin' />
          <h4>Finding content...</h4>
        </div>
      }
    },
    render: function () {
      if (this.state.api) {
        return <div className='comment-page'>
          <div className='text-center'>
            {this.getContext()}
          </div>
          {this.showComment()}
        </div>
      } else {
        return <GetIPFS api={this.state.boards} />
      }
    }
  })
}
