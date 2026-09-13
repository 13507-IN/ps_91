from .utils import metrics

def evaluate(actual, predicted):
    return metrics(actual, predicted)
