import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { groupBy } from 'lodash';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import * as bungie from '../../../utils/bungie';
import Items from '../../../components/Items';
import Spinner from '../../../components/UI/Spinner';
import { NoAuth, DiffProfile } from '../../../components/BungieAuth';

import './styles.css';

class Vendor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      data: false
    };
  }

  componentDidMount() {
    const { vendorHash = 672118013 } = this.props;

    this.getVendor(vendorHash);
  }

  componentDidUpdate(p, s) {
    if (s.loading !== this.state.loading) {
      this.props.rebindTooltips();
    }
  }

  getVendor = async hash => {
    const { member } = this.props;

    const response = await bungie.GetVendor(member.membershipType, member.membershipId, member.characterId, hash, [400, 402, 300, 301, 304, 305, 306, 307, 308, 600].join(','));

    if (response && response.ErrorCode === 1 && response.Response) {
      this.setState({
        loading: false,
        data: response.Response
      });
    } else {
      this.setState(p => ({
        ...p,
        loading: false
      }));
    }
  };

  render() {
    const { t, member, auth, vendorHash = 672118013 } = this.props;

    if (!auth) {
      return <NoAuth inline />;
    }

    if (auth && !auth.destinyMemberships.find(m => m.membershipId === member.membershipId)) {
      return <DiffProfile inline />;
    }

    const definitionVendor = manifest.DestinyVendorDefinition[vendorHash];

    if (auth && auth.destinyMemberships.find(m => m.membershipId === member.membershipId) && this.state.loading) {
      return (
        <div className='user-module vendor'>
          <div className='sub-header'>
            <div>{t('Vendor')}</div>
          </div>
          <h3>{definitionVendor.displayProperties.name}</h3>
          <Spinner />
        </div>
      );
    }

    const items = [];

    if (this.state.data) {
      Object.values(this.state.data.sales.data).forEach(sale => {
        items.push({
          vendorHash: definitionVendor.hash,
          ...sale,
          ...((sale.vendorItemIndex !== undefined && definitionVendor && definitionVendor.itemList && definitionVendor.itemList[sale.vendorItemIndex]) || {})
        });
      });
    }

    const itemsGrouped = groupBy(items, i => i.displayCategoryIndex);

    return (
      <div className='user-module vendor'>
        <div className='sub-header'>
          <div>{t('Vendor')}</div>
        </div>
        <h3>{definitionVendor.displayProperties.name}</h3>
        {definitionVendor.displayCategories.map((category, c) => {
          if (itemsGrouped[category.index]) {
            return (
              <React.Fragment key={c}>
                <h4>{category.displayProperties.name}</h4>
                <ul className='list inventory-items'>
                  <Items items={itemsGrouped[category.index]} />
                </ul>
              </React.Fragment>
            );
          } else {
            return null;
          }
        })}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    auth: state.auth
  };
}

function mapDispatchToProps(dispatch) {
  return {
    rebindTooltips: value => {
      dispatch({ type: 'REBIND_TOOLTIPS', payload: new Date().getTime() });
    }
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps), withTranslation())(Vendor);
