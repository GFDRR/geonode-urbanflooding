/*
#########################################################################
#
# Copyright (C) 2019 OSGeo
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
#########################################################################
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import HoverPaper from '../../atoms/hover-paper';
import HR from '../../atoms/hr';
import ResponseTime from '../../cels/response-time';
import Throughput from '../../cels/throughput';
import ErrorsRate from '../../cels/errors-rate';
import { getCount, getTime } from '../../../utils';
import styles from './styles';
import actions from './actions';


const mapStateToProps = (state) => ({
  errors: state.geonodeErrorSequence.response,
  interval: state.interval.interval,
  responseTimes: state.geonodeAverageResponse.response,
  responses: state.geonodeResponseSequence.response,
  throughputs: state.geonodeThroughputSequence.throughput,
  timestamp: state.interval.timestamp,
});


@connect(mapStateToProps, actions)
class GeonodeAnalytics extends React.Component {
  static propTypes = {
    errors: PropTypes.object,
    getErrors: PropTypes.func.isRequired,
    getResponseTimes: PropTypes.func.isRequired,
    getResponses: PropTypes.func.isRequired,
    getThroughputs: PropTypes.func.isRequired,
    interval: PropTypes.number,
    resetErrors: PropTypes.func.isRequired,
    resetResponseTimes: PropTypes.func.isRequired,
    resetResponses: PropTypes.func.isRequired,
    resetThroughputs: PropTypes.func.isRequired,
    responseTimes: PropTypes.object,
    responses: PropTypes.object,
    throughputs: PropTypes.object,
    timestamp: PropTypes.instanceOf(Date),
  }

  constructor(props) {
    super(props);
    this.get = (interval = this.props.interval) => {
      this.props.getResponses(interval);
      this.props.getResponseTimes(interval);
      this.props.getThroughputs(interval);
      this.props.getErrors(interval);
    };

    this.reset = () => {
      this.props.resetResponses();
      this.props.resetResponseTimes();
      this.props.resetThroughputs();
      this.props.resetErrors();
    };
  }

  componentWillMount() {
    this.get();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps) {
      if (nextProps.timestamp && nextProps.timestamp !== this.props.timestamp) {
        this.get(nextProps.interval);
      }
    }
  }

  componentWillUnmount() {
    this.reset();
  }

  render() {
    let responseData = [];
    let throughputData = [];
    let errorRateData = [];
    let averageResponseTime = 0;
    let maxResponseTime = 0;
    if (this.props.responseTimes) {
      const data = this.props.responseTimes.data.data;
      if (data.length > 0) {
        if (data[0].data.length > 0) {
          const metric = data[0].data[0];
          maxResponseTime = Math.floor(metric.max);
          averageResponseTime = Math.floor(metric.val);
        }
      }
    }
    responseData = getTime(this.props.responses);
    throughputData = getCount(this.props.throughputs);
    errorRateData = getCount(this.props.errors);
    return (
      <HoverPaper style={styles.content}>
        <h3>Geonode Analytics</h3>
        <ResponseTime
          average={averageResponseTime}
          max={maxResponseTime}
          data={responseData}
        />
        <HR />
        <Throughput data={throughputData} />
        <HR />
        <ErrorsRate data={errorRateData} />
      </HoverPaper>
    );
  }
}


export default GeonodeAnalytics;
