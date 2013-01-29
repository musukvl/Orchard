﻿using System;
using System.Collections.Generic;
using System.Linq;
using Orchard.ContentManagement;
using Orchard.Localization;
using Orchard.Workflows.Models;
using Orchard.Workflows.Services;

namespace Orchard.Workflows.Activities {
    public abstract class ContentActivity : Event {

        public Localizer T { get; set; }

        public override bool CanStartWorkflow {
            get { return true; }
        }

        public override bool CanExecute(WorkflowContext context) {
            try {

                string contentTypesState = context.State.ContentTypes;

                // "" means 'any'
                if (String.IsNullOrEmpty(contentTypesState)) {
                    return true;
                }

                string[] contentTypes = contentTypesState.Split(',');

                var content = context.Tokens["Content"] as IContent;

                if (content == null) {
                    return false;
                }

                return contentTypes.Any(contentType => content.ContentItem.TypeDefinition.Name == contentType);
            }
            catch {
                return false;
            }
        }

        public override IEnumerable<LocalizedString> GetPossibleOutcomes(WorkflowContext context) {
            return new[] { T("Done") };
        }

        public override IEnumerable<LocalizedString> Execute(WorkflowContext context) {
            yield return T("Done");
        }

        public override string Form {
            get {
                return "SelectContentTypes";
            }
        }

        public override LocalizedString Category {
            get { return T("Content Items"); }
        }
    }

    public class ContentCreatedActivity : ContentActivity {
        public override string Name {
            get { return "ContentCreated"; }
        }

        public override LocalizedString Description {
            get { return T("Content is created."); }
        }
    }

    public class ContentPublishedActivity : ContentActivity {
        public override string Name {
            get { return "ContentPublished"; }
        }


        public override LocalizedString Description {
            get { return T("Content is published."); }
        }
    }

    public class ContentVersionedActivity : ContentActivity {
        public override string Name {
            get { return "ContentVersioned"; }
        }


        public override LocalizedString Description {
            get { return T("Content is  versioned."); }
        }
    }

    public class ContentRemovedActivity : ContentActivity {
        public override string Name {
            get { return "ContentRemoved"; }
        }

        public override LocalizedString Description {
            get { return T("Content is  removed."); }
        }
    }
}