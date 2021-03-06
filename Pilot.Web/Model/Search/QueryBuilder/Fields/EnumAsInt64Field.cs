﻿using System;
using Pilot.Web.Model.Search.QueryBuilder.Tools;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    internal class EnumAsInt64Field<T> : EnumField<T>
    {
        public EnumAsInt64Field(string fieldName): base(fieldName)
        {
        }

        protected internal override string WithPrefix(T value)
        {
            return NumericAwarePrefix.NUMERIC_PREFIX_INT_64 + Convert.ToInt64(value);
        }
    }
}
