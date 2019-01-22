import React, {Component} from 'react'
import PropTypes from 'prop-types'
import './DashAverage.scss'

/**
 * ExampleComponent is an example component.
 * It takes a property, `label`, and
 * displays it.
 * It renders an input with the property `value`
 * which is editable by the user.
 */
export default class DashAverage extends Component {
    constructor() {
        super()
        this.state = {}
        this.handleChange = this.handleChange.bind(this)
        this.renderBlock = this.renderBlock.bind(this)
    }

    handleChange(e) {
        /*
            * Send the new value to the parent component.
            # setProps is a prop that is automatically supplied
            * by dash's front-end ("dash-renderer").
            * In a Dash app, this will send the data back to the
            * Python Dash app server.
            * If the component properties are not "subscribed"
            * to by a Dash callback, then Dash dash-renderer
            * will not pass through `setProps` and it is expected
            * that the component manages its own state.
            */

        const {setProps} = this.props
        const state = {
            loading: true
        }

        if (e.target.name === 'date') {
            state.date = e.target.value
        }
        
        if(e.target.name === 'period') {

            state.period = e.target.checked
                ? 'week'
                : 'day'
        }

        if (setProps) {
            setProps(state)
        } else {
            this.setState(state)
        }
    }

    renderBlock(nameStep) {
        const { data } = this.props
        const blockData = data.steps[nameStep]
        const meanTime = (blockData.mean).toFixed(1)
        const percent = (blockData.percent).toFixed(2)
        const style = {
            width: `${percent}%`,
        }

        return (
            <div style={style} key={nameStep} className="dash-average__block dash-average-block">
                <div style={style} className="dash-average-block__title-colorized">
                    <span>{nameStep}</span>
                </div>
                <div className="dash-average-block__title">{nameStep}</div>
                <div className="dash-average-block__percent">{percent}%</div>
                <div className="dash-average-block__minutes">{meanTime} min</div>
            </div>
        )
    }

    getMonth(date) {
        const formatDate = new Date(date)
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        return months[formatDate.getMonth()]
    }
    
    getDay(date) {
        const formatDate = new Date(date)
        return formatDate.getDate()
    }

    addAweek(date) {
        const formatDate = new Date(date)
        const week = formatDate.setDate(formatDate.getDate() + 7)
        return new Date(week)
    }

    render() {
        const { id, date, data, period } = this.props
        const objectKeys = Object.keys(data.steps)
        const title = period === 'week'
            ? 'Week time analysis'
            : 'Day time analysis'
        const dateStartStr = date.replace(/-/g, '\/')
        const dayStart = this.getDay(dateStartStr)
        const monthStart = this.getMonth(dateStartStr)        
        const dateEnd = this.addAweek(dateStartStr)
        const dateEndStr = `${dateEnd.getFullYear()}/${dateEnd.getMonth()+1}/${dateEnd.getDate()}`
        const dayEnd = this.getDay(dateEndStr)
        const monthEnd = this.getMonth(dateEndStr)
        const periodText = period === 'week'
            ? `${dayStart} ${monthStart} to ${dayEnd} ${monthEnd}`
            : `${dayStart} ${monthStart}`

            console.log(typeof date)

        return (
            <div id={id}>
                <div className="dash-average">
                    <div className="dash-average__controls">
                        <label className="dash-average__label group-date">
                            <span className="dash-average__label-text">Select a date</span>
                            <input
                                className="dash-average__input"
                                type="date"
                                name="date"
                                value={date}
                                onChange={this.handleChange}
                            />
                        </label>
                        <label className="dash-average__label">
                            <span className="dash-average__label-text">By week</span>
                            <div className="dash-average__checkbox">
                                <input 
                                    type="checkbox"
                                    name="period"
                                    value="weekly"
                                    onChange={this.handleChange}
                                />
                                <span className="checkmark" />
                            </div>
                        </label>
                    </div>

                    {date !== '' ? (
                        <div className="dash-average__content">
                            <div className="dash-average__header">
                                <h2 className="dash-average__title">{title}</h2>
                                <div className="dash-average__date">({periodText})</div>
                            </div>

                            <div className="dash-average__body">
                                {
                                    objectKeys.map(nameStep => {
                                        return this.renderBlock(nameStep)
                                    })
                                }
                            </div>
                        </div>
                    ) : (
                        <div className="select">
                            Select a date to show the order data.
                        </div>
                    )}
                    
                    {data.error ? (
                        <div className="dash-average__status">
                            {data.error.message}
                        </div>
                    ) : ''}
                </div>
            </div>
        )
    }
}

DashAverage.defaultProps = {
    data: {
        "error": {
            "message": "Message error"
        },
        "steps": {}
    }
}

DashAverage.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks
     */
    id: PropTypes.string,

    /**
     * Date to get orders
     */
    date: PropTypes.string,

    /**
     * Period time orders
     */
    period: PropTypes.string,

    /**
     * Dash-assigned callback that should be called whenever any of the
     * properties change
     */
    setProps: PropTypes.func,

    /**
     * Dash-assigned callback that should be called whenever any of the
     * properties change
     */
    data: PropTypes.object
}
