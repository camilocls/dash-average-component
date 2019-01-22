/* eslint no-magic-numbers: 0 */
import React, {Component} from 'react';

import { DashAverage } from '../lib';

class App extends Component {

    constructor() {
        super();
        this.state = {
            date: '2018-08-26',
            period: 'day',
            // data: {
            //     "error": false,
            //     "steps": {}
            // }
            data: {
                "error": false, 
                "steps": {
                        "acceptedByRestaurant": 
                            {"count": 1.0, "mean": 8.05685, "std": NaN, "min": 8.05685, "25%": 8.05685, "50%": 8.05685, "75%": 8.05685, "max": 8.05685, "percent": 15.120462048785372}, 
                        "courierArrived": 
                            {"count": 1.0, "mean": 21.243683333333333, "std": NaN, "min": 21.243683333333333, "25%": 21.243683333333333, "50%": 21.243683333333333, "75%": 21.243683333333333, "max": 21.243683333333333, "percent": 39.86847311518533}, 
                        "pickedUp": 
                            {"count": 1.0, "mean": 2.87725, "std": NaN, "min": 2.87725, "25%": 2.87725, "50%": 2.87725, "75%": 2.87725, "max": 2.87725, "percent": 5.399796375738372}, 
                        "botLoaded": 
                            {"count": 1.0, "mean": 1.8803, "std": NaN, "min": 1.8803, "25%": 1.8803, "50%": 1.8803, "75%": 1.8803, "max": 1.8803, "percent": 3.52879907039738}, 
                        "arriving": 
                            {"count": 1.0, "mean": 0.8174833333333333, "std": NaN, "min": 0.8174833333333333, "25%": 0.8174833333333333, "50%": 0.8174833333333333, "75%": 0.8174833333333333, "max": 0.8174833333333333, "percent": 1.534188388412497}, 
                        "waitingForClient": 
                            {"count": 1.0, "mean": 0.046283333333333336, "std": NaN, "min": 0.046283333333333336, "25%": 0.046283333333333336, "50%": 0.046283333333333336, "75%": 0.046283333333333336, "max": 0.046283333333333336, "percent": 0.08686091774799698}, 
                        "closed": 
                            {"count": 1.0, "mean": 18.362566666666666, "std": NaN, "min": 18.362566666666666, "25%": 18.362566666666666, "50%": 18.362566666666666, "75%": 18.362566666666666, "max": 18.362566666666666, "percent": 34.461420083733046}
                }
            }
        };
        this.setProps = this.setProps.bind(this);
    }

    setProps(newProps) {
        this.setState(newProps);
    }

    render() {
        return (
            <div>
                <DashAverage
                    setProps={this.setProps}
                    {...this.state}
                />
            </div>
        )
    }
}

export default App;
