import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../states';
import NameStepContainer from './steps/NameStepContainer';
import RuntimeStepContainer from './steps/RuntimeStepContainer';
import CapabilitiesStepContainer from './steps/CapabilitiesStepContainer';
import DeploymentStepContainer from './steps/DeploymentStepContainer';
import RepositoryStepContainer from './steps/RepositoryStepContainer';

import NextStepsZip from '@app/components/wizard/next-steps/NextStepsZip';
import NextStepsOpenShift from '@app/components/wizard/next-steps/NextStepsOpenShift';
import ProcessingApp from '@app/components/wizard/next-steps/ProcessingApp';
import { Projectile } from '@app/models/Projectile';
import * as _ from 'lodash';
import { getLaunchState } from '../../reducers/launchReducer';
import { launchActions } from '../../actions/launchActions';
import { SmartWizard, Step } from '@shared/smart-components/smart-wizard/SmartWizard';
import { smartWizardActions } from '@shared/smart-components/smart-wizard/smartWizardActions';


const wizardStepsDefinition = {
  nameStep: {
    id: 'nameStep',
    component: NameStepContainer,
  },
  runtimeStep: {
    id: 'runtimeStep',
    component: RuntimeStepContainer,
  },
  capabilityStep: {
    id: 'capabilityStep',
    component: CapabilitiesStepContainer,
  },
  repositoryStep: {
    id: 'repositoryStep',
    component: RepositoryStepContainer,
  },
  deploymentStep: {
    id: 'deploymentStep',
    component: DeploymentStepContainer,
  },
};

interface CreatorWizardProps {
  data: any;
  submission: {
    payload?: any;
    loading: boolean;
    progressEvents?: [];
    progressEventsResults?: [];
    completed: boolean;
    error?: string;
    result?: any;
  };

  saveWizard(payload): void;

  launchProjectile(payload): void;

  resetWizard(): void;

  resetLaunch(): void;
}

function buildProjectile(stepState: Step[]): Projectile {
  const byId = _.keyBy(stepState, 'id');
  return {
    name: _.get(byId[wizardStepsDefinition.nameStep.id], 'context.name'),
    runtime: {name:_.get(byId[wizardStepsDefinition.runtimeStep.id], 'context.runtime.id'), version: 'community'},
    capabilities: Array.from(_.get(byId[wizardStepsDefinition.capabilityStep.id], 'context.capabilities', [])),
    clusterId: _.get(byId[wizardStepsDefinition.deploymentStep.id], 'context.cluster.id'),
    projectName: _.get(byId[wizardStepsDefinition.nameStep.id], 'context.name'),
    gitOrganization: _.get(byId[wizardStepsDefinition.repositoryStep.id], 'context.repository.organization'),
    gitRepository: _.get(byId[wizardStepsDefinition.repositoryStep.id], 'context.repository.name'),
    deploymentLink: _.get(byId[wizardStepsDefinition.deploymentStep.id], 'context.cluster.consoleUrl'),
    repositoryLink: _.get(byId[wizardStepsDefinition.repositoryStep.id], 'context.repository.url'),
  };
}

class CreatorWizard extends Component<CreatorWizardProps> {

  constructor(props) {
    super(props);
  }

  public render() {
    return (
      <React.Fragment>
        <SmartWizard
          definition={wizardStepsDefinition}
          submit={this.props.launchProjectile}
          buildProjectile={buildProjectile}
        />
        <ProcessingApp isOpen={this.props.submission.loading}
                       progressEvents={this.props.submission.progressEvents}
                       progressEventsResults={this.props.submission.progressEventsResults}/>
        <NextStepsZip
          isOpen={this.props.submission.completed && this.props.submission.payload.target === 'zip'}
          error={Boolean(this.props.submission.error)}
          downloadLink={this.props.submission.result && this.props.submission.result.downloadLink}
          onClose={this.props.resetLaunch}
        />
        <NextStepsOpenShift
          isOpen={this.props.submission.completed && this.props.submission.payload.target === 'launch'}
          error={this.props.submission.error}
          deploymentLink={this.props.submission.payload && this.props.submission.payload.projectile.deploymentLink}
          repositoryLink={this.props.submission.payload && this.props.submission.payload.projectile.repositoryLink}
          landingPageLink={this.props.submission.payload && this.props.submission.payload.projectile.deploymentLink}
          onClose={this.reset}
        />
      </React.Fragment>
    );
  }

  private reset = () => {
    this.props.resetLaunch();
    this.props.resetWizard();
  };

}

const mapStateToProps = (state: AppState) => ({
  submission: getLaunchState(state).submission,
});

const mapDispatchToProps = (dispatch) => ({
  launchProjectile: (payload) => dispatch(launchActions.launchProjectile(payload)),
  resetWizard: () => dispatch(smartWizardActions.reset()),
  resetLaunch: () => dispatch(launchActions.resetLaunch()),
});

const CreatorWizardContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreatorWizard);

export default CreatorWizardContainer;
