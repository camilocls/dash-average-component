import dash_average_component
import dash
from dash.dependencies import Input, Output
import dash_html_components as html
import ast
import json
from pymongo import MongoClient
import os
import time
import pandas as pd
from datetime import datetime
import pytz
import math
from pandas.io.json import json_normalize
import numpy as np
from functools import reduce

def convert_date_to_ms(date_time):
    pattern = '%Y-%m-%d'
    utc = datetime.strptime(str(date_time), pattern)
    # time.mktime() return local time
    # heroku is UTC time so date will be in UTC timezone
    # date will be translated to seconds in UTC
    # e.g Aug. 8th --> UTC: 12:00 AM == Aug. 7th --> PST: 7:00 PM
    # add 7 hours so that it is Aug. 8th --> PST: 12:00 PM
    return (int(time.mktime(utc.timetuple())) + (7 * 3600)) * 1000

class Orders():
    """Gets orders from the orders database and returns it as a df"""
    db = object
    
    def __init__(self, query):
        # initialize access to db

        mongo_uri = os.environ['MONGO_URI']
        client = MongoClient('{}'.format(mongo_uri))
        db = client.data_metrics
        collection = db['orders']

        data = list(collection.find(query))
        df = json_normalize(data)
        # save the db connection
        self.response = df

def orders_delivery_time(date, period, campus, mode):
    """Computes the statistics of every step of the delivery process for a given day. You can input a week, campus, and mode; to receive a DataFrame which gives you all the stats for a given day. Cancelled and scheduled orders are ignored.
    Args:
    date (str): the date for the desired analysis
    campus (list): one or more zone IDs for analyis
    mode (str): all/simulated/real select what kinds of orders you want

    Returns:
    delivery_times (DataFrame): statistics for a given day"""
 
    # prepares the campus filter
    campusFilter = [{'zoneId': i} for i in campus]

    # prepares the start and stop time for extracting orders
    start = convert_date_to_ms(date) # timestamp of the startDate

    if(period == 'week'):
        # 1 week
        end = start + (7* 86400 * 1000) # timestamp of the end of the endDate
    else:
        # timestamp of the startDate
        end = start + (86400 * 1000) # timestamp of the end of the endDate
        
    # filter the orders data
    if mode == 'all':
        orders = Orders({'state.status': 'closed', 'state.openTimestamp':{'$gte': start, '$lte': end}}).response
    elif mode == 'simulate':
        orders = Orders({'simulated': True,'state.status': 'closed', 'state.openTimestamp':{'$gte': start, '$lte': end}, '$or': campusFilter}).response
    else:
        orders = Orders({'simulated': False,'state.status': 'closed', 'state.openTimestamp':{'$gte': start, '$lte': end}, '$or': campusFilter}).response
    
    if(orders.empty):
        return {
            'error': {
                'message': 'No orders in this date'
            },
            'steps': False
        } 
        
    # select the columns that we desire
    orders = orders[['state.statusHistory']]

    
    # create a list to contain the processed orders
    df_list = []

    # look through each order
    for i in orders.index:
        try:
            # extract the status history
            status_history = orders.iat[i, 0]

            # if the order is not scheduled
                # if not 'scheduled' in tags:

            # create a dataframe
            df = pd.DataFrame(status_history)
            
            # create empty dict for results
            delivery_metric = {}            
            # extract each relevant timestamp
            delivery_metric['created'] = int(df[df['name'] == 'created'].value)            
            delivery_metric['acceptedByRestaurant'] = int(df[df['name'] == 'acceptedByRestaurant'].value)
            
            delivery_metric['courierArrived'] = int(df[df['name'] == 'courierArrived'].value)
            delivery_metric['pickedUp'] = int(df[df['name'] == 'pickedUp'].value)
            delivery_metric['botLoaded'] = int(df[df['name'] == 'botLoaded'].value)
            delivery_metric['arriving'] = int(df[df['name'] == 'arriving'].value)
            delivery_metric['waitingForClient'] = int(df[df['name'] =='waitingForClient'].value)
            delivery_metric['closed'] = int(df[df['name'] == 'closed'].value)
            # create a series
            d_metric = pd.Series(delivery_metric)

            # append it to our list of proccesed orders, reversing the
            # order of timestamps to facilitate analysis
            df_list.append(d_metric[::-1])
        except:
            # fail silently if an order is cancelled or doesn't have the right timestamps
            pass
        
    if(len(df_list) == 0):
        return {
            'error': {
                'message': 'The state history is not correct in these orders'
            },
            'steps': False
        } 
    
    # create dataframe with processed orders
    delivery_times = pd.DataFrame(df_list)

    # calculate the time between each state
    delivery_times = delivery_times.T.diff(periods = -1)

    # show the result in minutes
    delivery_times = delivery_times.apply(lambda x: x/60000).T

    # run statistics
    delivery_times = delivery_times.describe()
    
    # Get total time average orders
    def getTotalTimeDelivery(ac, curr):
        curr = delivery_times[curr]['mean']
        if(math.isnan(curr)):
                return ac
        return ac + curr
    
    # Get percent time of total time orders 
    def getPercentStepDelivery(step, timeDelivery):
        timeStep = delivery_times[step]['mean']
        percent = float(timeStep/timeDelivery) * 100
        return percent
        
    timeDelivery = reduce(getTotalTimeDelivery, delivery_times, 0)

    # show only the columns that we like
    delivery_times = delivery_times[[
    'acceptedByRestaurant',
    'courierArrived',
    'pickedUp',
    'botLoaded',
    'arriving',
    'waitingForClient',
    'closed']]
    
    # Add a row with percent of the time for each step 
    delivery_times.loc['percent'] = [
        getPercentStepDelivery('acceptedByRestaurant', timeDelivery),
        getPercentStepDelivery('courierArrived', timeDelivery),
        getPercentStepDelivery('pickedUp', timeDelivery),
        getPercentStepDelivery('botLoaded', timeDelivery),
        getPercentStepDelivery('arriving', timeDelivery),
        getPercentStepDelivery('waitingForClient', timeDelivery),
        getPercentStepDelivery('closed', timeDelivery)
    ]

    # Convert to json
    
    steps_data = {
        'error': False,
        'steps': delivery_times.to_dict()
    }
    
    steps_data = json.dumps(steps_data)
    steps_data = json.loads(steps_data)
    
    # return delivery_times
    return steps_data

# orders_delivery_time('2018-08-26', 'day', '576b0601bc47978b6c437637', 'all')

app = dash.Dash(__name__)

app.scripts.config.serve_locally = True
app.css.config.serve_locally = True

server = app.server

app.layout = html.Div([
    dash_average_component.DashAverage(
        id='input',
        date='',
        period='day',
        data={
            "status": "Loading data...",
            "steps": {}
        }
    ),
    html.Div(id='output')
])

@app.callback(
    Output('input', 'data'), 
    [
        Input('input', 'date'), 
        Input('input', 'period')
    ]
)
def update_figure(date, period):
    data = orders_delivery_time(date, period, '576b0601bc47978b6c437637', 'all')
    return data

if __name__ == '__main__':
    app.run_server(debug=True)